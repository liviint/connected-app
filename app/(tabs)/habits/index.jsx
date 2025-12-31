import { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import AllHabits from "../../../src/components/habits/AllHabits";
import PageLoader from "../../../src/components/common/PageLoader";
import {getHabits} from "../../../src/db/habitsDb"
import { useSQLiteContext } from 'expo-sqlite';

export default function HabitsPage() {
    const db = useSQLiteContext(); 
    const isFocused = useIsFocused()
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let fetchHabits = async() => {
            if(!isFocused) return
            let habits = await getHabits(db)
            setHabits(habits)
            setLoading(false)
        }
        fetchHabits()
    }, [isFocused]);
    
    if (loading) return <PageLoader />

    return <AllHabits initialHabits={habits} />
    }