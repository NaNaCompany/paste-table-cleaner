import assert from'node:assert/strict';
import{cleanTable,exportTable,parseTable,spaceSeparated,markdownCell}from'./dist/core.js';
let n=0;function test(name,fn){fn();n++;console.log('PASS',name);}
test('quoted TSV multiline, escaped quotes and zeros remain',()=>{const r=cleanTable('id\tnote\n001\t"x\ty\n""z"""');assert.deepEqual(r.rows,[['id','note'],['001','x\ty\n"z"']]);});
test('trim, collapse, blank row and empty column independent',()=>{const r=cleanTable('id,v,\n 001 ,  A   B  ,\n,,',{collapse:true,emptyColumns:true});assert.deepEqual(r.rows,[['id','v'],['001','A B']]);assert.equal(r.removedRows,1);assert.equal(r.removedColumns,1);assert.equal(r.changed,2);});
test('line breaks preserved by default and flattened explicitly',()=>{const text='a,b\r\n1,"x\r\ny"';assert.equal(cleanTable(text).rows[1][1],'x\r\ny');assert.equal(cleanTable(text,{flatten:true}).rows[1][1],'x y');});
test('ragged rows rejected unless padding explicitly enabled',()=>{assert.throws(()=>cleanTable('a,b\n1'),{message:'RAGGED'});assert.deepEqual(cleanTable('a,b\n1',{pad:true}).rows,[['a','b'],['1','']]);try{cleanTable('a,b\n\n1');assert.fail('must reject');}catch(e){assert.equal(e.record,3);}});
test('repeated spaces split outside quotes only',()=>{const r=cleanTable('id  name  note\n001  "A  B"  "x\ny"',{delimiter:'spaces'});assert.deepEqual(r.rows,[['id','name','note'],['001','A  B','x\ny']]);assert.equal(spaceSeparated('"a""  b"  c'),'"a""  b"\tc');});
test('CSV and TSV safe escaping, multiline roundtrip',()=>{const rows=[['x','y'],['001','=1+2'],['a,b','x\ny"z']];assert.deepEqual(parseTable(exportTable(rows,'csv',{safe:false}),','),rows);assert.deepEqual(parseTable(exportTable(rows,'tsv',{safe:false}),'\t'),rows);assert.equal(parseTable(exportTable(rows,'csv'))[1][1],"'=1+2");});
test('Markdown escaping, line break and generated header',()=>{assert.equal(markdownCell('<img>|a\nb'),'&lt;img&gt;\\|a<br>b');assert.equal(exportTable([['a','b'],['1','2']],'markdown'),'| a | b |\n| --- | --- |\n| 1 | 2 |');assert.equal(exportTable([['1']],'markdown',{header:false,columnName:i=>'C'+i}),'| C1 |\n| --- |\n| 1 |');});
test('malformed, empty and extreme inputs reject',()=>{assert.throws(()=>cleanTable(''));assert.throws(()=>cleanTable('a,b\n1,"x'));assert.throws(()=>cleanTable('a,b\n1,"x"q'));assert.throws(()=>cleanTable('  \n  ',{blankRows:true}));assert.throws(()=>cleanTable('a'.repeat(2000001)));});
globalThis.location={pathname:'/de/'};
const {catalogs,t}=await import('./dist/i18n.js');
test('six complete cleaner catalogs and German route',()=>{assert.equal(Object.keys(catalogs).length,6);for(const [locale,dict]of Object.entries(catalogs))for(const [key,value]of Object.entries(dict))assert.ok(typeof value==='string'&&value.length,locale+'/'+key);assert.equal(t('title'),'Kopierte Tabellen bereinigen');assert.equal(t('columnName',{n:2}),'Spalte 2');});
console.log(`${n} fixture groups passed`);
