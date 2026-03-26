import { useEffect } from "react";

export function useSyncEngine({
  name,
  bootstrap,
}) {

  const safeBootstrap = async (reason) => {
    try {
      console.log(`🔄 [${name}] Sync started (${reason})`);
      await bootstrap();
      console.log(`✅ [${name}] Sync completed`);
    } catch (e) {
      console.error(`❌ [${name}] Sync error`, e);
    } 
  };
  
  useEffect(() => {
    const init = async () => {
        safeBootstrap("initial");
    };
    init();

    
  }, []);
}
