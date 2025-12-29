import { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { api } from "../../../api";
import AllHabits from "../../../src/components/habits/AllHabits";
import AccountInfoPage from "../../../src/components/common/AccountInfoPage";
import PageLoader from "../../../src/components/common/PageLoader";

export default function HabitsPage() {
    const isUserLoggedIn = useSelector((state) => state?.user?.userDetails);
    const isFocused = useIsFocused()
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(!isFocused) return
        api
        .get("/habits/")
        .then((res) => setHabits(res.data.results))
        .finally(() => setLoading(false));
    }, [isFocused]);

    const saveOrder = async () => {
        try {
        const order = habits.map((h) => h.id);
        await api.post("/habits/reorder/", { order });
        } catch (err) {
        console.log("Order save failed:", err);
        }
    };

    // Auto-save habit order
    useEffect(() => {
        if (!loading) {
        const timer = setTimeout(saveOrder, 500);
        return () => clearTimeout(timer);
        }
    }, [habits]);


    if (!isUserLoggedIn) return <AccountInfoPage />
    
    if (loading) return <PageLoader />

    return <AllHabits habits={habits} setHabits={setHabits} />
    }