const {publish}=require('./release-manager.cjs');
try { publish({module:process.argv.includes('--module')?process.argv[process.argv.indexOf('--module')+1]:undefined}); }
catch(error){console.error(error.message);process.exitCode=1;}
