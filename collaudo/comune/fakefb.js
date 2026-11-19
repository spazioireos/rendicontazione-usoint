/* FINTA FIREBASE (compat 10.x) PER IL BANCO DI PROVA — SOLO DATI INVENTATI.
   Sostituisce firebase-app-compat + firebase-auth-compat + firebase-firestore-compat nelle
   quattro app (Fogli ore, Collaboratori, Dipendenti, USOINT) e nella pagina integrata.

   STATO
   - Database: un oggetto {percorso: dati} PER PROGETTO (projectId della config), salvato in
     localStorage sotto "__fakefb__<projectId>". Si rilegge a OGNI operazione: app diverse servite
     dalla stessa origine e schede diverse vedono le stesse scritture; i dati sopravvivono al
     ricaricamento.
   - Utenti: "__fakefb_auth__<projectId>" = {email: {uid,email,password}}.
   - Sessione: "__fakefb_sess__<projectId>__<nomeApp>" (come Firebase vero, che la tiene per app).

   COMANDI PER I TEST (window.__fakefb)
     failWrites, failReads, failAuth : true -> rifiutano con code 'unavailable' / 'auth/network-request-failed'
     delayMs (tutte), readDelayMs, writeDelayMs, authDelayMs : ritardo in ms
     deny : [{project?, coll|path|re, op:'read'|'write'|'*'}] -> 'permission-denied'
     requireAuth : true -> lettura/scrittura senza utente collegato = 'permission-denied'
     strict (default true) : rifiuta undefined, array annidati, documenti > 1 MiB, batch > 500, 'in' > 30
     authErrors : 'nuovi' (default: auth/invalid-credential) | 'vecchi' (user-not-found / wrong-password)
     log : elenco {t,op,project,app,path,data} di tutte le operazioni ; persistLog:true lo copia anche
           in localStorage "__fakefb_log__" (utile con la pagina integrata, che ha più finestre)
     seed(projectId,{percorso:dati}), dump(projectId), reset(projectId,{utenti:true}), addUser(projectId,{email,password,uid}),
     login(projectId,email,nomeApp), logout(projectId,nomeApp), mails (reset password inviati)
   I comandi si possono dare PRIMA che l'app carichi:
     - window.__fakefb = {failWrites:true, ...}   (da page.addInitScript: viene fuso, non sostituito)
     - localStorage "__fakefb_cfg__" = JSON degli stessi flag (vale per tutte le finestre/ricarichi)
     - window.__FAKEFB_SEED__ oppure localStorage "__fakefb_seed__" = {id?, <projectId>:{reset?,docs:{},users:[],session:{email,app}}}
       con "id" la semina si applica UNA volta sola per origine (registro "__fakefb_seeded__").
   Timestamp nei dati di semina: {"__ts": millisecondi}. */
(function(){
  'use strict';
  var W = window;
  var PRE = (W.__fakefb && typeof W.__fakefb === 'object') ? W.__fakefb : {};
  var FF = W.__fakefb = PRE;
  if (!FF.log) FF.log = [];
  if (!FF.mails) FF.mails = [];
  FF.versione = 'fakefb 1.0 (compat 10.x)';

  /* ---------------------------------------------------------------- utilità */
  function lsGet(k){ try { return W.localStorage.getItem(k); } catch(e){ return null; } }
  function lsSet(k,v){ try { W.localStorage.setItem(k,v); } catch(e){ console.warn('[fakefb] localStorage pieno?', e); throw e; } }
  function lsDel(k){ try { W.localStorage.removeItem(k); } catch(e){} }
  function cfgLS(){ try { return JSON.parse(lsGet('__fakefb_cfg__') || '{}') || {}; } catch(e){ return {}; } }
  function flag(n, def){ if (FF[n] !== undefined) return FF[n]; var c = cfgLS(); return (c[n] !== undefined) ? c[n] : def; }
  function rid(n){ var s='', a='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; for (var i=0;i<n;i++) s += a.charAt(Math.floor(Math.random()*a.length)); return s; }
  function wait(ms){ return new Promise(function(r){ setTimeout(r, ms>0?ms:0); }); }
  function FirebaseError(code, message){ var e = new Error(message); e.name = 'FirebaseError'; e.code = code; return e; }
  function logOp(op, project, app, path, data){
    var r = { t: Date.now(), op: op, project: project, app: app, path: path, data: data === undefined ? undefined : safeClone(data) };
    FF.log.push(r);
    if (flag('persistLog', false)) {
      try { var L = JSON.parse(lsGet('__fakefb_log__') || '[]'); L.push(r); if (L.length > 2000) L = L.slice(L.length-2000); lsSet('__fakefb_log__', JSON.stringify(L)); } catch(e){}
    }
  }
  function safeClone(x){ try { return JSON.parse(JSON.stringify(enc(x, true))); } catch(e){ return String(x); } }

  /* ---------------------------------------------------------------- Timestamp e sentinelle */
  function Timestamp(seconds, nanoseconds){ this.seconds = seconds; this.nanoseconds = nanoseconds || 0; }
  Timestamp.prototype.toMillis = function(){ return this.seconds*1000 + Math.floor(this.nanoseconds/1e6); };
  Timestamp.prototype.toDate = function(){ return new Date(this.toMillis()); };
  Timestamp.prototype.isEqual = function(o){ return o instanceof Timestamp && o.seconds===this.seconds && o.nanoseconds===this.nanoseconds; };
  Timestamp.prototype.valueOf = function(){ return String(this.seconds).padStart(12,'0') + '.' + String(this.nanoseconds).padStart(9,'0'); };
  Timestamp.prototype.toString = function(){ return 'Timestamp(seconds=' + this.seconds + ', nanoseconds=' + this.nanoseconds + ')'; };
  Timestamp.prototype.toJSON = function(){ return { seconds: this.seconds, nanoseconds: this.nanoseconds }; };
  Timestamp.fromMillis = function(ms){ return new Timestamp(Math.floor(ms/1000), (ms%1000)*1e6); };
  Timestamp.fromDate = function(d){ return Timestamp.fromMillis(d.getTime()); };
  Timestamp.now = function(){ return Timestamp.fromMillis(Date.now()); };

  function Sentinel(kind, arg){ this.__fakefbSentinel = kind; this.arg = arg; }
  var FieldValue = {
    serverTimestamp: function(){ return new Sentinel('ts'); },
    delete: function(){ return new Sentinel('del'); },
    arrayUnion: function(){ return new Sentinel('union', Array.prototype.slice.call(arguments)); },
    arrayRemove: function(){ return new Sentinel('remove', Array.prototype.slice.call(arguments)); },
    increment: function(n){ return new Sentinel('inc', n); }
  };
  function GeoPoint(lat, lng){ this.latitude = lat; this.longitude = lng; }
  var FieldPath = function(){ this._segs = Array.prototype.slice.call(arguments); };
  FieldPath.documentId = function(){ return '__name__'; };

  /* codifica per localStorage: Timestamp/Date -> {__ts}, NaN/Infinity -> {__num} */
  function enc(v, loose){
    if (v instanceof Timestamp) return { __ts: v.toMillis() };
    if (v instanceof Date) return { __ts: v.getTime() };
    if (typeof v === 'number' && !isFinite(v)) return { __num: String(v) };
    if (v instanceof GeoPoint) return { __geo: [v.latitude, v.longitude] };
    if (Array.isArray(v)) return v.map(function(x){ return enc(x, loose); });
    if (v && typeof v === 'object') {
      if (v.__fakefbSentinel) return loose ? { __sentinel: v.__fakefbSentinel } : v;
      var o = {}; for (var k in v) if (Object.prototype.hasOwnProperty.call(v,k)) o[k] = enc(v[k], loose); return o;
    }
    return v;
  }
  function dec(v){
    if (Array.isArray(v)) return v.map(dec);
    if (v && typeof v === 'object') {
      var ks = Object.keys(v);
      if (ks.length === 1 && ks[0] === '__ts' && typeof v.__ts === 'number') return Timestamp.fromMillis(v.__ts);
      if (ks.length === 1 && ks[0] === '__num') return Number(v.__num);
      if (ks.length === 1 && ks[0] === '__geo') return new GeoPoint(v.__geo[0], v.__geo[1]);
      var o = {}; for (var i=0;i<ks.length;i++) o[ks[i]] = dec(v[ks[i]]); return o;
    }
    return v;
  }
  function isPlain(v){ return v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Timestamp) && !(v instanceof Date) && !(v instanceof Sentinel) && !(v instanceof GeoPoint); }

  /* convalida come Firestore vero (strict) */
  function valida(data, metodo, campo, inArray){
    if (data === undefined) throw FirebaseError('invalid-argument', 'Function ' + metodo + ' called with invalid data. Unsupported field value: undefined' + (campo ? ' (found in field ' + campo + ')' : ''));
    if (typeof data === 'function') throw FirebaseError('invalid-argument', 'Function ' + metodo + ' called with invalid data. Unsupported field value: a function' + (campo ? ' (found in field ' + campo + ')' : ''));
    if (Array.isArray(data)) {
      if (inArray) throw FirebaseError('invalid-argument', 'Function ' + metodo + ' called with invalid data. Nested arrays are not supported.');
      for (var i=0;i<data.length;i++) valida(data[i], metodo, campo, true);
      return;
    }
    if (isPlain(data)) { for (var k in data) if (Object.prototype.hasOwnProperty.call(data,k)) valida(data[k], metodo, campo ? campo + '.' + k : k, false); }
  }

  /* applica sentinelle e valori (risolve FieldValue) */
  function risolvi(v, vecchio){
    if (v instanceof Sentinel) {
      switch (v.__fakefbSentinel) {
        case 'ts': return { __ts: Date.now() };
        case 'inc': return (typeof vecchio === 'number' ? vecchio : 0) + v.arg;
        case 'union': { var a = Array.isArray(vecchio) ? vecchio.slice() : []; v.arg.forEach(function(x){ var ex = enc(x); if (!a.some(function(y){ return JSON.stringify(y) === JSON.stringify(ex); })) a.push(ex); }); return a; }
        case 'remove': { var b = Array.isArray(vecchio) ? vecchio.slice() : []; var rm = v.arg.map(function(x){ return JSON.stringify(enc(x)); }); return b.filter(function(y){ return rm.indexOf(JSON.stringify(y)) < 0; }); }
      }
    }
    if (isPlain(v)) { var o = {}; for (var k in v) { if (!Object.prototype.hasOwnProperty.call(v,k)) continue; if (v[k] instanceof Sentinel && v[k].__fakefbSentinel === 'del') continue; o[k] = risolvi(v[k], vecchio && typeof vecchio === 'object' ? vecchio[k] : undefined); } return o; }
    return enc(v);
  }
  function fondi(vecchio, nuovo){ /* set({merge:true}): fusione profonda */
    var o = (vecchio && typeof vecchio === 'object' && !Array.isArray(vecchio)) ? JSON.parse(JSON.stringify(vecchio)) : {};
    for (var k in nuovo) {
      if (!Object.prototype.hasOwnProperty.call(nuovo,k)) continue;
      var v = nuovo[k];
      if (v instanceof Sentinel && v.__fakefbSentinel === 'del') { delete o[k]; continue; }
      if (isPlain(v)) o[k] = fondi(o[k] && isPlain(o[k]) && !('__ts' in o[k]) ? o[k] : {}, v);
      else o[k] = risolvi(v, o[k]);
    }
    return o;
  }
  function ponCampo(obj, segs, v){ /* update con percorsi "a.b.c" */
    var cur = obj;
    for (var i=0;i<segs.length-1;i++){ if (!cur[segs[i]] || typeof cur[segs[i]] !== 'object' || Array.isArray(cur[segs[i]])) cur[segs[i]] = {}; cur = cur[segs[i]]; }
    var last = segs[segs.length-1];
    if (v instanceof Sentinel && v.__fakefbSentinel === 'del') delete cur[last];
    else cur[last] = risolvi(v, cur[last]);
  }
  function leggiCampo(obj, campo){
    if (campo === '__name__') return undefined;
    var segs = String(campo).split('.'), cur = obj;
    for (var i=0;i<segs.length;i++){ if (cur == null || typeof cur !== 'object') return undefined; cur = cur[segs[i]]; }
    return cur;
  }

  /* ---------------------------------------------------------------- archivio per progetto */
  var cacheDB = {};
  function chiaveDB(p){ return '__fakefb__' + p; }
  function leggiDB(p){
    var raw = lsGet(chiaveDB(p)) || '{}';
    var c = cacheDB[p];
    if (c && c.raw === raw) return c.obj;
    var obj; try { obj = JSON.parse(raw) || {}; } catch(e){ obj = {}; }
    cacheDB[p] = { raw: raw, obj: obj };
    return obj;
  }
  function scriviDB(p, obj){ var raw = JSON.stringify(obj); lsSet(chiaveDB(p), raw); cacheDB[p] = { raw: raw, obj: obj }; notificaAscoltatori(p); }
  function leggiUtenti(p){ try { return JSON.parse(lsGet('__fakefb_auth__' + p) || '{}') || {}; } catch(e){ return {}; } }
  function scriviUtenti(p, u){ lsSet('__fakefb_auth__' + p, JSON.stringify(u)); }

  function normPath(p){ return String(p).split('/').filter(function(s){ return s !== ''; }).join('/'); }
  function segs(p){ return normPath(p).split('/'); }

  /* ---------------------------------------------------------------- regole e guasti */
  function collDi(path){ var s = segs(path); return (s.length % 2 === 0) ? s[s.length-2] : s[s.length-1]; }
  function controlla(fs, op, path){
    var deny = flag('deny', null);
    if (deny) {
      var arr = Array.isArray(deny) ? deny : [deny];
      for (var i=0;i<arr.length;i++){
        var r = arr[i]; if (!r) continue;
        if (r.project && r.project !== fs._project) continue;
        if (r.op && r.op !== '*' && r.op !== op) continue;
        var ok = true;
        if (r.coll && collDi(path) !== r.coll && segs(path)[0] !== r.coll) ok = false;
        if (r.path && normPath(path).indexOf(normPath(r.path)) !== 0) ok = false;
        if (r.re && !(new RegExp(r.re)).test(normPath(path))) ok = false;
        if (ok) return FirebaseError('permission-denied', 'Missing or insufficient permissions.');
      }
    }
    if (flag('requireAuth', false) && !fs._app.auth().currentUser) return FirebaseError('permission-denied', 'Missing or insufficient permissions.');
    if (op === 'read' && flag('failReads', false)) return FirebaseError('unavailable', 'Failed to get document because the client is offline.');
    if (op === 'write' && flag('failWrites', false)) return FirebaseError('unavailable', 'Failed to get document because the client is offline.');
    return null;
  }
  function ritardo(op){ var d = flag(op === 'read' ? 'readDelayMs' : 'writeDelayMs', undefined); if (d === undefined) d = flag('delayMs', 0); return wait(d || 0); }

  /* ---------------------------------------------------------------- snapshot */
  function DocumentSnapshot(ref, raw){
    this.ref = ref; this.id = ref.id; this.exists = raw !== undefined && raw !== null;
    this._raw = raw; this.metadata = { fromCache: false, hasPendingWrites: false, isEqual: function(o){ return !!o; } };
  }
  DocumentSnapshot.prototype.data = function(){ return this.exists ? dec(JSON.parse(JSON.stringify(this._raw))) : undefined; };
  DocumentSnapshot.prototype.get = function(f){ if (!this.exists) return undefined; var v = leggiCampo(this._raw, f); return v === undefined ? undefined : dec(JSON.parse(JSON.stringify(v))); };
  DocumentSnapshot.prototype.isEqual = function(o){ return o && o.ref && o.ref.path === this.ref.path && JSON.stringify(o._raw) === JSON.stringify(this._raw); };
  function QuerySnapshot(query, docs){
    this.query = query; this.docs = docs; this.size = docs.length; this.empty = docs.length === 0;
    this.metadata = { fromCache: false, hasPendingWrites: false };
  }
  QuerySnapshot.prototype.forEach = function(cb, thisArg){ this.docs.forEach(function(d){ cb.call(thisArg, d); }); };
  QuerySnapshot.prototype.docChanges = function(){ return this.docs.map(function(d,i){ return { type: 'added', doc: d, oldIndex: -1, newIndex: i }; }); };

  /* ---------------------------------------------------------------- riferimenti */
  function DocumentReference(fs, path){
    this.firestore = fs; this.path = normPath(path); var s = segs(this.path);
    if (s.length % 2 !== 0) throw FirebaseError('invalid-argument', 'Invalid document reference. Document references must have an even number of segments, but ' + this.path + ' has ' + s.length + '.');
    this.id = s[s.length-1];
  }
  Object.defineProperty(DocumentReference.prototype, 'parent', { get: function(){ var s = segs(this.path); return new CollectionReference(this.firestore, s.slice(0, -1).join('/')); } });
  DocumentReference.prototype.collection = function(p){ return new CollectionReference(this.firestore, this.path + '/' + normPath(p)); };
  DocumentReference.prototype.isEqual = function(o){ return o && o.path === this.path && o.firestore === this.firestore; };
  DocumentReference.prototype.withConverter = function(){ return this; };
  DocumentReference.prototype.get = function(){
    var self = this, fs = this.firestore;
    logOp('get', fs._project, fs._app.name, self.path);
    return ritardo('read').then(function(){
      var err = controlla(fs, 'read', self.path); if (err) throw err;
      var db = leggiDB(fs._project);
      return new DocumentSnapshot(self, db[self.path]);
    });
  };
  DocumentReference.prototype.set = function(data, opts){
    var fs = this.firestore, self = this;
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw FirebaseError('invalid-argument', 'Function DocumentReference.set() called with invalid data. Data must be an object, but it was: ' + (Array.isArray(data) ? 'an array' : String(data)));
    if (flag('strict', true)) valida(data, 'DocumentReference.set()');
    logOp('set', fs._project, fs._app.name, self.path, data);
    return fs._scrivi([{ tipo: 'set', ref: self, data: data, merge: !!(opts && (opts.merge || opts.mergeFields)) }]);
  };
  DocumentReference.prototype.update = function(a, b){
    var fs = this.firestore, self = this, data = a;
    if (typeof a === 'string') { data = {}; var args = arguments; for (var i=0;i<args.length;i+=2) data[args[i]] = args[i+1]; }
    if (flag('strict', true)) valida(data, 'DocumentReference.update()');
    logOp('update', fs._project, fs._app.name, self.path, data);
    return fs._scrivi([{ tipo: 'update', ref: self, data: data }]);
  };
  DocumentReference.prototype.delete = function(){
    var fs = this.firestore;
    logOp('delete', fs._project, fs._app.name, this.path);
    return fs._scrivi([{ tipo: 'delete', ref: this }]);
  };
  DocumentReference.prototype.onSnapshot = function(a, b, c){
    var self = this, cb = a, cbErr = b;
    if (a && typeof a === 'object' && typeof a.next !== 'function' && typeof b === 'function') { cb = b; cbErr = c; }
    if (a && typeof a.next === 'function') { cb = a.next.bind(a); cbErr = a.error && a.error.bind(a); }
    return ascolta(this.firestore._project, function(){ return self.get(); }, cb, cbErr);
  };

  function Query(fs, collPath, filtri, ordini, lim, limUltimi){
    this.firestore = fs; this._coll = normPath(collPath); this._filtri = filtri || []; this._ordini = ordini || []; this._lim = lim; this._limUltimi = limUltimi;
  }
  var OPS = ['==','!=','<','<=','>','>=','in','not-in','array-contains','array-contains-any'];
  Query.prototype._copia = function(){ return new Query(this.firestore, this._coll, this._filtri.slice(), this._ordini.slice(), this._lim, this._limUltimi); };
  Query.prototype.where = function(campo, op, val){
    if (campo instanceof FieldPath) campo = campo._segs.join('.');
    if (OPS.indexOf(op) < 0) throw FirebaseError('invalid-argument', 'Function Query.where() called with invalid data. Invalid operator "' + op + '".');
    if ((op === 'in' || op === 'not-in' || op === 'array-contains-any') && (!Array.isArray(val) || !val.length)) throw FirebaseError('invalid-argument', "Invalid Query. A non-empty array is required for '" + op + "' filters.");
    if (flag('strict', true) && (op === 'in' || op === 'array-contains-any') && val.length > 30) throw FirebaseError('invalid-argument', "Invalid Query. '" + op + "' filters support a maximum of 30 elements in the value array.");
    if (val === undefined) throw FirebaseError('invalid-argument', 'Function Query.where() called with invalid data. Unsupported field value: undefined');
    var q = this._copia(); q._filtri.push({ campo: campo, op: op, val: enc(val) }); return q;
  };
  Query.prototype.orderBy = function(campo, dir){ if (campo instanceof FieldPath) campo = campo._segs.join('.'); var q = this._copia(); q._ordini.push({ campo: campo, dir: dir === 'desc' ? -1 : 1 }); return q; };
  Query.prototype.limit = function(n){ var q = this._copia(); q._lim = n; q._limUltimi = undefined; return q; };
  Query.prototype.limitToLast = function(n){ var q = this._copia(); q._limUltimi = n; q._lim = undefined; return q; };
  Query.prototype.startAt = Query.prototype.startAfter = Query.prototype.endAt = Query.prototype.endBefore = function(){ console.warn('[fakefb] startAt/startAfter/endAt/endBefore non implementati: ignorati'); return this._copia(); };
  Query.prototype.withConverter = function(){ return this; };
  function confronta(a, b){ /* ordine semplificato: null < bool < numeri < Timestamp < stringhe < altro */
    function rango(x){ if (x === null || x === undefined) return 0; if (typeof x === 'boolean') return 1; if (typeof x === 'number') return 2; if (x && x.__ts !== undefined) return 3; if (typeof x === 'string') return 4; return 5; }
    var ra = rango(a), rb = rango(b); if (ra !== rb) return ra - rb;
    if (ra === 3) { a = a.__ts; b = b.__ts; }
    if (ra === 5) { a = JSON.stringify(a); b = JSON.stringify(b); }
    return a < b ? -1 : (a > b ? 1 : 0);
  }
  function uguale(a, b){ if (typeof a === 'number' && typeof b === 'number') return a === b; return JSON.stringify(a) === JSON.stringify(b); }
  function passa(raw, id, f){
    var v = (f.campo === '__name__') ? id : leggiCampo(raw, f.campo), w = f.val;
    var c = (v !== undefined);
    switch (f.op) {
      case '==': return c && uguale(v, w);
      case '!=': return c && v !== null && !uguale(v, w);
      case '<': return c && typeof v === typeof w && confronta(v, w) < 0;
      case '<=': return c && typeof v === typeof w && confronta(v, w) <= 0;
      case '>': return c && typeof v === typeof w && confronta(v, w) > 0;
      case '>=': return c && typeof v === typeof w && confronta(v, w) >= 0;
      case 'in': return c && w.some(function(x){ return uguale(v, x); });
      case 'not-in': return c && v !== null && !w.some(function(x){ return uguale(v, x); });
      case 'array-contains': return c && Array.isArray(v) && v.some(function(x){ return uguale(x, w); });
      case 'array-contains-any': return c && Array.isArray(v) && v.some(function(x){ return w.some(function(y){ return uguale(x, y); }); });
    }
    return false;
  }
  Query.prototype._esegui = function(){
    var fs = this.firestore, db = leggiDB(fs._project), pre = this._coll + '/', n = segs(this._coll).length + 1, self = this, out = [];
    Object.keys(db).forEach(function(p){
      if (p.indexOf(pre) !== 0 || segs(p).length !== n) return;
      var raw = db[p], id = segs(p)[n-1];
      for (var i=0;i<self._filtri.length;i++) if (!passa(raw, id, self._filtri[i])) return;
      for (var j=0;j<self._ordini.length;j++) if (self._ordini[j].campo !== '__name__' && leggiCampo(raw, self._ordini[j].campo) === undefined) return; /* orderBy esclude chi non ha il campo */
      out.push({ p: p, id: id, raw: raw });
    });
    var ord = this._ordini.length ? this._ordini : [];
    out.sort(function(a, b){
      for (var i=0;i<ord.length;i++){ var va = ord[i].campo === '__name__' ? a.id : leggiCampo(a.raw, ord[i].campo), vb = ord[i].campo === '__name__' ? b.id : leggiCampo(b.raw, ord[i].campo); var r = confronta(va, vb) * ord[i].dir; if (r) return r; }
      return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);
    });
    if (this._lim !== undefined) out = out.slice(0, this._lim);
    if (this._limUltimi !== undefined) out = out.slice(Math.max(0, out.length - this._limUltimi));
    return new QuerySnapshot(this, out.map(function(o){ return new DocumentSnapshot(new DocumentReference(fs, o.p), o.raw); }));
  };
  Query.prototype.get = function(){
    var self = this, fs = this.firestore;
    logOp('query', fs._project, fs._app.name, self._coll, self._filtri.length || self._ordini.length || self._lim ? { where: self._filtri, orderBy: self._ordini, limit: self._lim } : undefined);
    return ritardo('read').then(function(){ var err = controlla(fs, 'read', self._coll); if (err) throw err; return self._esegui(); });
  };
  Query.prototype.onSnapshot = function(a, b, c){
    var self = this, cb = a, cbErr = b;
    if (a && typeof a === 'object' && typeof a.next !== 'function' && typeof b === 'function') { cb = b; cbErr = c; }
    if (a && typeof a.next === 'function') { cb = a.next.bind(a); cbErr = a.error && a.error.bind(a); }
    return ascolta(this.firestore._project, function(){ return self.get(); }, cb, cbErr);
  };
  Query.prototype.isEqual = function(o){ return o && o._coll === this._coll && JSON.stringify([o._filtri, o._ordini, o._lim]) === JSON.stringify([this._filtri, this._ordini, this._lim]); };

  function CollectionReference(fs, path){
    Query.call(this, fs, path);
    var s = segs(path);
    if (s.length % 2 !== 1) throw FirebaseError('invalid-argument', 'Invalid collection reference. Collection references must have an odd number of segments, but ' + normPath(path) + ' has ' + s.length + '.');
    this.id = s[s.length-1]; this.path = normPath(path);
  }
  CollectionReference.prototype = Object.create(Query.prototype);
  CollectionReference.prototype.constructor = CollectionReference;
  Object.defineProperty(CollectionReference.prototype, 'parent', { get: function(){ var s = segs(this.path); return s.length > 1 ? new DocumentReference(this.firestore, s.slice(0,-1).join('/')) : null; } });
  CollectionReference.prototype.doc = function(id){ if (id === undefined) id = rid(20); return new DocumentReference(this.firestore, this.path + '/' + normPath(id)); };
  CollectionReference.prototype.add = function(data){ var r = this.doc(); return r.set(data).then(function(){ return r; }); };

  /* ---------------------------------------------------------------- ascoltatori (onSnapshot) */
  var ascoltatori = [];
  function ascolta(project, getter, cb, cbErr){
    var voce = { project: project, getter: getter, cb: cb, cbErr: cbErr, vivo: true };
    ascoltatori.push(voce);
    var giro = function(){ if (!voce.vivo) return; getter().then(function(s){ if (voce.vivo && cb) cb(s); }, function(e){ if (voce.vivo && cbErr) cbErr(e); }); };
    voce.giro = giro; setTimeout(giro, 0);
    return function(){ voce.vivo = false; };
  }
  function notificaAscoltatori(project){ ascoltatori.forEach(function(v){ if (v.vivo && v.project === project) setTimeout(v.giro, 0); }); }
  W.addEventListener('storage', function(ev){
    if (!ev.key) return;
    if (ev.key.indexOf('__fakefb__') === 0) { var p = ev.key.slice(10); delete cacheDB[p]; notificaAscoltatori(p); }
    if (ev.key.indexOf('__fakefb_sess__') === 0) { istanze.forEach(function(a){ if (a._auth && ev.key === a._auth._chiaveSess) a._auth._daStorage(); }); }
  });

  /* ---------------------------------------------------------------- Firestore */
  function Firestore(app){ this.app = app; this._app = app; this._project = app.options.projectId || app.name; this.type = 'firestore'; }
  Firestore.prototype.collection = function(p){ return new CollectionReference(this, p); };
  Firestore.prototype.doc = function(p){ return new DocumentReference(this, p); };
  Firestore.prototype.collectionGroup = function(id){
    var fs = this, q = new Query(fs, id);
    q._esegui = function(){ var db = leggiDB(fs._project), out = []; Object.keys(db).forEach(function(p){ var s = segs(p); if (s.length % 2 === 0 && s[s.length-2] === id) { var ok = true; for (var i=0;i<q._filtri.length;i++) if (!passa(db[p], s[s.length-1], q._filtri[i])) ok = false; if (ok) out.push(new DocumentSnapshot(new DocumentReference(fs, p), db[p])); } }); return new QuerySnapshot(q, out); };
    var w = q.where; q.where = function(){ var n = w.apply(q, arguments); n._esegui = q._esegui; return n; };
    return q;
  };
  Firestore.prototype.batch = function(){ return new WriteBatch(this); };
  Firestore.prototype.enablePersistence = function(){ return Promise.resolve(); };
  Firestore.prototype.clearPersistence = function(){ return Promise.resolve(); };
  Firestore.prototype.enableNetwork = function(){ return Promise.resolve(); };
  Firestore.prototype.disableNetwork = function(){ return Promise.resolve(); };
  Firestore.prototype.waitForPendingWrites = function(){ return Promise.resolve(); };
  Firestore.prototype.terminate = function(){ return Promise.resolve(); };
  Firestore.prototype.settings = function(){};
  Firestore.prototype.useEmulator = function(){};
  Firestore.prototype.runTransaction = function(fn){
    var fs = this, ops = [];
    var tx = {
      get: function(ref){ return ref.get(); },
      set: function(ref, d, o){ if (flag('strict', true)) valida(d, 'Transaction.set()'); ops.push({ tipo: 'set', ref: ref, data: d, merge: !!(o && o.merge) }); return tx; },
      update: function(ref, d){ ops.push({ tipo: 'update', ref: ref, data: d }); return tx; },
      delete: function(ref){ ops.push({ tipo: 'delete', ref: ref }); return tx; }
    };
    return Promise.resolve(fn(tx)).then(function(r){ logOp('transaction', fs._project, fs._app.name, '(' + ops.length + ' scritture)'); return fs._scrivi(ops).then(function(){ return r; }); });
  };
  /* scrittura atomica di un elenco di operazioni */
  Firestore.prototype._scrivi = function(ops){
    var fs = this;
    return ritardo('write').then(function(){
      for (var i=0;i<ops.length;i++){ var err = controlla(fs, 'write', ops[i].ref.path); if (err) throw err; }
      var db = JSON.parse(JSON.stringify(leggiDB(fs._project)));
      ops.forEach(function(o){
        var p = o.ref.path;
        if (o.tipo === 'delete') { delete db[p]; return; }
        if (o.tipo === 'set') { db[p] = o.merge ? fondi(db[p], o.data) : risolvi(o.data, undefined); }
        if (o.tipo === 'update') {
          if (db[p] === undefined) throw FirebaseError('not-found', 'No document to update: projects/' + fs._project + '/databases/(default)/documents/' + p);
          var nuovo = JSON.parse(JSON.stringify(db[p]));
          Object.keys(o.data).forEach(function(k){ ponCampo(nuovo, k.split('.'), o.data[k]); });
          db[p] = nuovo;
        }
        if (flag('strict', true)) {
          var dim = JSON.stringify(db[p]).length;
          if (dim > 1048487) throw FirebaseError('invalid-argument', 'Document \'projects/' + fs._project + '/databases/(default)/documents/' + p + '\' cannot be written because its size (' + dim + ' bytes) exceeds the maximum allowed size of 1,048,576 bytes.');
        }
      });
      scriviDB(fs._project, db);
    });
  };
  function WriteBatch(fs){ this._fs = fs; this._ops = []; this._chiuso = false; }
  WriteBatch.prototype._agg = function(o){ if (this._chiuso) throw FirebaseError('failed-precondition', 'A write batch can no longer be used after commit() has been called.'); this._ops.push(o); return this; };
  WriteBatch.prototype.set = function(ref, d, o){ if (flag('strict', true)) valida(d, 'WriteBatch.set()'); return this._agg({ tipo: 'set', ref: ref, data: d, merge: !!(o && (o.merge || o.mergeFields)) }); };
  WriteBatch.prototype.update = function(ref, d){ if (flag('strict', true)) valida(d, 'WriteBatch.update()'); return this._agg({ tipo: 'update', ref: ref, data: d }); };
  WriteBatch.prototype.delete = function(ref){ return this._agg({ tipo: 'delete', ref: ref }); };
  WriteBatch.prototype.commit = function(){
    var fs = this._fs; this._chiuso = true;
    logOp('batch', fs._project, fs._app.name, '(' + this._ops.length + ' scritture)', this._ops.map(function(o){ return { tipo: o.tipo, path: o.ref.path, data: o.data }; }));
    if (flag('strict', true) && this._ops.length > 500) return Promise.reject(FirebaseError('invalid-argument', 'Maximum 500 writes allowed per request'));
    return fs._scrivi(this._ops);
  };

  /* ---------------------------------------------------------------- Auth */
  function creaUtente(u, auth){
    return {
      uid: u.uid, email: u.email, emailVerified: !!u.emailVerified, displayName: u.displayName || null, photoURL: null,
      phoneNumber: null, isAnonymous: false, providerId: 'firebase', tenantId: null,
      providerData: [{ providerId: 'password', uid: u.email, email: u.email, displayName: u.displayName || null }],
      metadata: { creationTime: new Date(u.creato || Date.now()).toUTCString(), lastSignInTime: new Date().toUTCString() },
      getIdToken: function(){ return Promise.resolve('fake-token-' + u.uid); },
      getIdTokenResult: function(){ return Promise.resolve({ token: 'fake-token-' + u.uid, claims: {} }); },
      reload: function(){ return Promise.resolve(); },
      updateProfile: function(p){ var t = leggiUtenti(auth._project); if (t[u.email]) { if (p && 'displayName' in p) t[u.email].displayName = p.displayName; scriviUtenti(auth._project, t); } if (p && 'displayName' in p) this.displayName = p.displayName; return Promise.resolve(); },
      updatePassword: function(pw){ var t = leggiUtenti(auth._project); if (t[u.email]) { t[u.email].password = pw; scriviUtenti(auth._project, t); } return Promise.resolve(); },
      sendEmailVerification: function(){ return Promise.resolve(); },
      delete: function(){ var t = leggiUtenti(auth._project); delete t[u.email]; scriviUtenti(auth._project, t); return auth.signOut(); },
      toJSON: function(){ return { uid: u.uid, email: u.email }; }
    };
  }
  function Auth(app){
    this.app = app; this._project = app.options.projectId || app.name; this._ascolti = [];
    this._chiaveSess = '__fakefb_sess__' + this._project + '__' + app.name;
    this.languageCode = null; this.tenantId = null; this.settings = {};
    this.currentUser = this._utenteDaSess();
  }
  Auth.prototype._utenteDaSess = function(){
    try { var s = JSON.parse(lsGet(this._chiaveSess) || 'null'); if (!s) return null; var t = leggiUtenti(this._project); var u = t[s.email]; if (!u || u.uid !== s.uid) return null; return creaUtente(u, this); } catch(e){ return null; }
  };
  Auth.prototype._cambia = function(u){
    this.currentUser = u;
    if (u) lsSet(this._chiaveSess, JSON.stringify({ uid: u.uid, email: u.email })); else lsDel(this._chiaveSess);
    var self = this; this._ascolti.slice().forEach(function(cb){ try { cb(u); } catch(e){ setTimeout(function(){ throw e; }, 0); } });
  };
  Auth.prototype._daStorage = function(){ var u = this._utenteDaSess(); var prima = this.currentUser ? this.currentUser.uid : null; if ((u ? u.uid : null) !== prima) { this.currentUser = u; this._ascolti.slice().forEach(function(cb){ cb(u); }); } };
  Auth.prototype.onAuthStateChanged = function(a, b){
    var cb = (typeof a === 'function') ? a : (a && a.next ? a.next.bind(a) : function(){});
    var self = this; this._ascolti.push(cb);
    setTimeout(function(){ if (self._ascolti.indexOf(cb) >= 0) { try { cb(self.currentUser); } catch(e){ setTimeout(function(){ throw e; }, 0); } } }, flag('authDelayMs', 0) || 0);
    return function(){ var i = self._ascolti.indexOf(cb); if (i >= 0) self._ascolti.splice(i, 1); };
  };
  Auth.prototype.onIdTokenChanged = Auth.prototype.onAuthStateChanged;
  Auth.prototype._erroreAuth = function(){ if (flag('failAuth', false)) return FirebaseError('auth/network-request-failed', 'Firebase: Error (auth/network-request-failed).'); return null; };
  function validaEmail(e){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || '')); }
  Auth.prototype.signInWithEmailAndPassword = function(email, pw){
    var self = this; email = String(email || '').trim();
    logOp('signIn', this._project, this.app.name, email);
    return wait(flag('authDelayMs', 0) || 0).then(function(){
      var e0 = self._erroreAuth(); if (e0) throw e0;
      if (!validaEmail(email)) throw FirebaseError('auth/invalid-email', 'Firebase: Error (auth/invalid-email).');
      if (!pw) throw FirebaseError('auth/missing-password', 'Firebase: Error (auth/missing-password).');
      var t = leggiUtenti(self._project), u = null;
      for (var k in t) if (k.toLowerCase() === email.toLowerCase()) u = t[k];
      var vecchi = flag('authErrors', 'nuovi') === 'vecchi';
      if (!u) throw vecchi ? FirebaseError('auth/user-not-found', 'Firebase: Error (auth/user-not-found).') : FirebaseError('auth/invalid-credential', 'Firebase: Error (auth/invalid-credential).');
      if (u.disabled) throw FirebaseError('auth/user-disabled', 'Firebase: Error (auth/user-disabled).');
      if (u.password !== pw) throw vecchi ? FirebaseError('auth/wrong-password', 'Firebase: Error (auth/wrong-password).') : FirebaseError('auth/invalid-credential', 'Firebase: Error (auth/invalid-credential).');
      var utente = creaUtente(u, self); self._cambia(utente);
      return { user: utente, credential: null, operationType: 'signIn', additionalUserInfo: { isNewUser: false, providerId: 'password', profile: {} } };
    });
  };
  Auth.prototype.createUserWithEmailAndPassword = function(email, pw){
    var self = this; email = String(email || '').trim();
    logOp('createUser', this._project, this.app.name, email);
    return wait(flag('authDelayMs', 0) || 0).then(function(){
      var e0 = self._erroreAuth(); if (e0) throw e0;
      if (!validaEmail(email)) throw FirebaseError('auth/invalid-email', 'Firebase: Error (auth/invalid-email).');
      if (!pw || String(pw).length < 6) throw FirebaseError('auth/weak-password', 'Firebase: Password should be at least 6 characters (auth/weak-password).');
      var t = leggiUtenti(self._project);
      for (var k in t) if (k.toLowerCase() === email.toLowerCase()) throw FirebaseError('auth/email-already-in-use', 'Firebase: Error (auth/email-already-in-use).');
      var u = { uid: rid(28), email: email, password: String(pw), creato: Date.now() };
      t[email] = u; scriviUtenti(self._project, t);
      var utente = creaUtente(u, self); self._cambia(utente);
      return { user: utente, credential: null, operationType: 'signIn', additionalUserInfo: { isNewUser: true, providerId: 'password', profile: {} } };
    });
  };
  Auth.prototype.signOut = function(){ logOp('signOut', this._project, this.app.name, ''); this._cambia(null); return Promise.resolve(); };
  Auth.prototype.setPersistence = function(){ return Promise.resolve(); };
  Auth.prototype.useEmulator = function(){};
  Auth.prototype.useDeviceLanguage = function(){};
  Auth.prototype.sendPasswordResetEmail = function(email){
    var self = this; logOp('passwordReset', this._project, this.app.name, email);
    return wait(flag('authDelayMs', 0) || 0).then(function(){
      var e0 = self._erroreAuth(); if (e0) throw e0;
      if (!validaEmail(email)) throw FirebaseError('auth/invalid-email', 'Firebase: Error (auth/invalid-email).');
      if (flag('authErrors', 'nuovi') === 'vecchi' && !leggiUtenti(self._project)[email]) throw FirebaseError('auth/user-not-found', 'Firebase: Error (auth/user-not-found).');
      FF.mails.push({ project: self._project, email: email, t: Date.now() });
    });
  };
  Auth.prototype.fetchSignInMethodsForEmail = function(email){ return Promise.resolve(leggiUtenti(this._project)[email] ? ['password'] : []); };
  var AuthStatic = function(app){ return (app || firebase.app()).auth(); };
  AuthStatic.Auth = { Persistence: { LOCAL: 'local', SESSION: 'session', NONE: 'none' } };
  AuthStatic.EmailAuthProvider = { PROVIDER_ID: 'password', credential: function(e, p){ return { email: e, password: p, providerId: 'password' }; } };
  AuthStatic.GoogleAuthProvider = function(){};

  /* ---------------------------------------------------------------- App e namespace */
  var istanze = [];
  function App(config, name){ this.name = name; this.options = Object.assign({}, config); this._auth = null; this._fs = null; this.automaticDataCollectionEnabled = false; }
  App.prototype.auth = function(){ if (!this._auth) this._auth = new Auth(this); return this._auth; };
  App.prototype.firestore = function(){ if (!this._fs) this._fs = new Firestore(this); return this._fs; };
  App.prototype.delete = function(){ var i = istanze.indexOf(this); if (i >= 0) istanze.splice(i, 1); return Promise.resolve(); };

  var firebase = {
    SDK_VERSION: '10.14.1-fake',
    apps: istanze,
    initializeApp: function(config, name){
      name = (typeof name === 'string' && name) ? name : (name && name.name) || '[DEFAULT]';
      for (var i=0;i<istanze.length;i++) if (istanze[i].name === name) throw FirebaseError('app/duplicate-app', "Firebase: Firebase App named '" + name + "' already exists with different options or config (app/duplicate-app).");
      var a = new App(config || {}, name); istanze.push(a);
      logOp('initializeApp', a.options.projectId, name, '');
      return a;
    },
    app: function(name){
      name = name || '[DEFAULT]';
      for (var i=0;i<istanze.length;i++) if (istanze[i].name === name) return istanze[i];
      throw FirebaseError('app/no-app', "Firebase: No Firebase App '" + name + "' has been created - call initializeApp() first (app/no-app).");
    },
    auth: AuthStatic,
    firestore: function(app){ return (app || firebase.app()).firestore(); },
    registerVersion: function(){}, setLogLevel: function(){}, onLog: function(){}
  };
  firebase.firestore.FieldValue = FieldValue;
  firebase.firestore.Timestamp = Timestamp;
  firebase.firestore.GeoPoint = GeoPoint;
  firebase.firestore.FieldPath = FieldPath;
  firebase.firestore.Blob = { fromBase64String: function(s){ return s; } };
  firebase.firestore.CACHE_SIZE_UNLIMITED = -1;
  firebase.firestore.setLogLevel = function(){};
  W.firebase = firebase;

  /* ---------------------------------------------------------------- API di servizio per i test */
  function tuttiProgetti(){ var r = []; try { for (var i=0;i<W.localStorage.length;i++){ var k = W.localStorage.key(i); if (k && k.indexOf('__fakefb__') === 0) r.push(k.slice(10)); } } catch(e){} return r; }
  FF.seed = function(project, docs, opz){
    var db = (opz && opz.reset) ? {} : JSON.parse(JSON.stringify(leggiDB(project)));
    Object.keys(docs || {}).forEach(function(p){ var np = normPath(p); if (segs(np).length % 2) throw new Error('[fakefb] seed: "' + p + '" non è un documento (numero di segmenti dispari)'); if (docs[p] === null) delete db[np]; else db[np] = enc(docs[p]); });
    scriviDB(project, db); return Object.keys(docs || {}).length;
  };
  FF.dump = function(project){ if (!project) { var o = {}; tuttiProgetti().forEach(function(p){ o[p] = JSON.parse(JSON.stringify(leggiDB(p))); }); return o; } return JSON.parse(JSON.stringify(leggiDB(project))); };
  FF.get = function(project, path){ var v = leggiDB(project)[normPath(path)]; return v === undefined ? undefined : JSON.parse(JSON.stringify(v)); };
  FF.reset = function(project, opz){ var ps = project ? [project] : tuttiProgetti(); ps.forEach(function(p){ scriviDB(p, {}); if (opz && (opz.utenti || opz.users)) lsDel('__fakefb_auth__' + p); }); FF.log.length = 0; };
  FF.addUser = function(project, u){
    var t = leggiUtenti(project); var uid = u.uid || rid(28);
    t[u.email] = { uid: uid, email: u.email, password: u.password || 'password', creato: Date.now(), disabled: !!u.disabled, displayName: u.displayName || null };
    scriviUtenti(project, t); return uid;
  };
  FF.users = function(project){ return leggiUtenti(project); };
  FF.login = function(project, email, appName){ var u = leggiUtenti(project)[email]; if (!u) throw new Error('[fakefb] login: utente ' + email + ' non trovato in ' + project); lsSet('__fakefb_sess__' + project + '__' + (appName || '[DEFAULT]'), JSON.stringify({ uid: u.uid, email: u.email })); istanze.forEach(function(a){ if (a._auth && a._auth._chiaveSess === '__fakefb_sess__' + project + '__' + (appName || '[DEFAULT]')) a._auth._daStorage(); }); return u.uid; };
  FF.logout = function(project, appName){ lsDel('__fakefb_sess__' + project + '__' + (appName || '[DEFAULT]')); istanze.forEach(function(a){ if (a._auth) a._auth._daStorage(); }); };
  FF.apps = function(){ return istanze.map(function(a){ return { name: a.name, projectId: a.options.projectId, utente: a._auth && a._auth.currentUser ? a._auth.currentUser.email : null }; }); };
  FF.setCfg = function(c){ lsSet('__fakefb_cfg__', JSON.stringify(Object.assign(cfgLS(), c || {}))); };
  FF.clearCfg = function(){ lsDel('__fakefb_cfg__'); ['failWrites','failReads','failAuth','delayMs','readDelayMs','writeDelayMs','authDelayMs','deny','requireAuth'].forEach(function(k){ delete FF[k]; }); };
  FF.Timestamp = Timestamp;

  /* semina rimandata: window.__FAKEFB_SEED__ (da addInitScript) oppure localStorage "__fakefb_seed__" */
  function applicaSemina(S){
    if (!S || typeof S !== 'object') return;
    if (S.id) { var fatti = []; try { fatti = JSON.parse(lsGet('__fakefb_seeded__') || '[]'); } catch(e){} if (fatti.indexOf(S.id) >= 0) return; fatti.push(S.id); lsSet('__fakefb_seeded__', JSON.stringify(fatti)); }
    if (S.cfg) FF.setCfg(S.cfg);
    Object.keys(S).forEach(function(p){
      if (p === 'id' || p === 'cfg') return;
      var x = S[p] || {};
      if (x.reset) scriviDB(p, {});
      if (x.resetUsers) lsDel('__fakefb_auth__' + p);
      (x.users || []).forEach(function(u){ FF.addUser(p, u); });
      if (x.docs) FF.seed(p, x.docs);
      if (x.session) { var ss = Array.isArray(x.session) ? x.session : [x.session]; ss.forEach(function(s){ FF.login(p, s.email, s.app); }); }
    });
  }
  try { applicaSemina(W.__FAKEFB_SEED__); } catch(e){ console.error('[fakefb] semina da __FAKEFB_SEED__ fallita', e); }
  try { var sl = lsGet('__fakefb_seed__'); if (sl) { lsDel('__fakefb_seed__'); applicaSemina(JSON.parse(sl)); } } catch(e){ console.error('[fakefb] semina da localStorage fallita', e); }
})();
