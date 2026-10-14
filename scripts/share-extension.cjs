try{require('./release-manager.cjs').manager().share();}catch(error){console.error(error.message);process.exitCode=1;}
