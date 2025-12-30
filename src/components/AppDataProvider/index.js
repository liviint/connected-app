import JournalsProvider from "./JournalsProvider"
import HabitsProvider from "./HabitsProvider"
export default function AppDataProvider({ children }) {
    return (<>
        <JournalsProvider />
        <HabitsProvider />
    </>)
}

