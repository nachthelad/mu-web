const {rollback}=require('./release-manager.cjs');
try {
 const at=process.argv.indexOf('--set');
 if(at<0||!process.argv[at+1])throw Error('Uso: npm run rollback -- --set <id>');
 rollback(process.argv[at+1]);
}catch(error){console.error(error.message);process.exitCode=1;}
