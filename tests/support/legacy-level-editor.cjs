// Older regression suites exercise the explicitly recoverable route editor.
module.exports=async page=>page.addLocatorHandler(page.locator('.map-leveling:visible'),async()=>{
 const focused=await page.evaluateHandle(()=>{let n=document.activeElement;while(n?.shadowRoot?.activeElement)n=n.shadowRoot.activeElement;return n;});
 const recovery=page.locator('.level-recovery');
 if(!await recovery.evaluate(n=>n.open))await recovery.locator('summary').first().click();
 await recovery.locator('.legacy-edit').click();
 await focused.evaluate(n=>{if(n?.isConnected)n.focus({preventScroll:true});});await focused.dispose();
});
