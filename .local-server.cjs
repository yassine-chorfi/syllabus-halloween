const http=require('http'), fs=require('fs'), path=require('path');
const root=process.cwd();
http.createServer((req,res)=>{
 let pathname; try {pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)} catch {res.writeHead(400);return res.end()}
 const file=path.resolve(root,'.'+(pathname==='/'?'/test.html':pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
 fs.stat(file,(err,stat)=>{
  if(err||!stat.isFile()){res.writeHead(404);return res.end('Not found')}
  const types={'.html':'text/html; charset=utf-8','.png':'image/png','.mp4':'video/mp4','.mp3':'audio/mpeg'};
  const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes'};
  const range=req.headers.range;
  let start=0,end=stat.size-1,status=200;
  if(range){const m=/^bytes=(\d+)-(\d*)$/.exec(range);if(!m){res.writeHead(416);return res.end()}start=Number(m[1]);end=m[2]?Math.min(Number(m[2]),end):end;if(start>end){res.writeHead(416,{'Content-Range':'bytes */'+stat.size});return res.end()}status=206;headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`}
  headers['Content-Length']=end-start+1;res.writeHead(status,headers);
  if(req.method==='HEAD')return res.end();fs.createReadStream(file,{start,end}).pipe(res);
 });
}).listen(8080,'127.0.0.1',()=>console.log('Site ready on port 8080'));
