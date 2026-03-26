import { useSQLiteContext } from "expo-sqlite";
import { syncManager } from "../../../utils/syncManager";
import { useSyncEngine } from "../../../src/hooks/useSyncEngine";
import {
    seedMoodsIfNeeded,
} from "../../db/journalsDb";

export default function JournalsProvider({ children }) {
    const db = useSQLiteContext();
    
    const bootstrap = async () => {
        await seedMoodsIfNeeded(db);
        syncManager.emit("journals_updated");
    };

    useSyncEngine({
        name: "journals",
        bootstrap,
    });

    return children;
}
