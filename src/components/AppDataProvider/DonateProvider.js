import { useEffect } from "react";
import { 
    initConnection,
} from "react-native-iap";

export default function DonateProvider({ children }) {
    useEffect(() => {
        const setup = async () => {
            try {
            await initConnection();
            } catch (err) {
            console.warn("Connection error", err);
            }
        };
        setup();
    }, []);
    return <>
        { children }
    </>
}
