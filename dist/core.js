import{parseTable,detectDelimiter,serialize,safeCell}from'./table.js';
export {parseTable,serialize,safeCell};
export function spaceSeparated(text){let out='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){out+=c;if(quoted&&text[i+1]==='"'){out+='"';i++;}else quoted=!quoted;}else if(c===' '&&!quoted&&text[i+1]===' '){while(text[i+1]===' ')i++;out+='\t';}else out+=c;}return out;}
export function cleanTable(text,options={}){
 const o={delimiter:'auto',trim:true,collapse:false,blankRows:true,emptyColumns:false,flatten:false,pad:false,...options};
 const actual=o.delimiter==='auto'?detectDelimiter(text):o.delimiter==='spaces'?'\t':o.delimiter;
 const source=o.delimiter==='spaces'?spaceSeparated(text):text;
 let rows=parseTable(source,actual),originalRows=rows.length,changed=0,recordNumbers=rows.map((_,i)=>i+1);
 rows=rows.map(row=>row.map(cell=>{let next=cell;if(o.trim)next=next.trim();if(o.collapse)next=next.replace(/[ \u00a0]+/g,' ');if(o.flatten)next=next.replace(/\r\n|\r|\n/g,' ');if(next!==cell)changed++;return next;}));
 if(o.blankRows){const keep=rows.map((row,i)=>({row,record:recordNumbers[i]})).filter(({row})=>row.some(cell=>cell.trim()!==''));rows=keep.map(x=>x.row);recordNumbers=keep.map(x=>x.record);}
 if(!rows.length)throw Error('EMPTY_RESULT');
 const width=Math.max(...rows.map(row=>row.length));
 const irregular=rows.map((row,i)=>({record:recordNumbers[i],count:row.length})).filter(row=>row.count!==width);
 if(irregular.length&&!o.pad){const e=Error('RAGGED');e.record=irregular[0].record;e.actual=irregular[0].count;e.expected=width;throw e;}
 if(o.pad)rows=rows.map(row=>[...row,...Array(width-row.length).fill('')]);
 let removedColumns=0;
 if(o.emptyColumns){const keep=Array.from({length:width},(_,i)=>i).filter(i=>rows.some(row=>row[i].trim()!==''));removedColumns=width-keep.length;rows=rows.map(row=>keep.map(i=>row[i]));}
 if(!rows[0].length)throw Error('EMPTY_RESULT');
 const riskCount=rows.flat().filter(cell=>safeCell(cell)!==cell).length;
 return {rows,changed,removedRows:originalRows-rows.length,removedColumns,paddedRows:irregular.length,riskCount,delimiter:actual};
}
export function markdownCell(value){return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('\\','\\\\').replaceAll('|','\\|').replace(/\r\n|\n|\r/g,'<br>');}
export function exportTable(rows,format,{safe=true,header=true,columnName=i=>'Column '+i}={}){
 if(format==='csv')return serialize(rows,',',safe);
 if(format==='tsv')return serialize(rows,'\t',safe);
 if(format!=='markdown')throw Error('FORMAT');
 const body=rows.map(row=>row.map(markdownCell)),heads=header?body.shift():rows[0].map((_,i)=>markdownCell(columnName(i+1)));
 const line=row=>'| '+row.join(' | ')+' |';
 return [line(heads),line(heads.map(()=>'---')),...body.map(line)].join('\n');
}
