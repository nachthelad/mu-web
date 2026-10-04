const path=require('node:path'),{execFileSync}=require('node:child_process');
for(const file of ['radar-ui.cjs','helper-ui.cjs','hub-ui.cjs','hub-position-ui.cjs','hub-panels-ui.cjs'])execFileSync(process.execPath,[path.resolve(__dirname,'../tests',file)],{cwd:path.resolve(__dirname,'..'),stdio:'inherit'});
