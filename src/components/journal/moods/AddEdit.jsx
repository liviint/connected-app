import { useEffect, useState } from "react";
import {
    View,
    Pressable,
    Alert,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
    saveMoods,
    getMoodByUuid,
    getLocalMoods,
} from "../../../../src/db/journalsDb";
import { useThemeStyles } from "../../../../src/hooks/useThemeStyles";
import { BodyText, Card, FormLabel, Input, TextArea } from "../../../../src/components/ThemeProvider/components";


const AddMood = () => {
    const { id:uuid } = useLocalSearchParams();
    const router = useRouter();
    const { globalStyles } = useThemeStyles();
    const db = useSQLiteContext();

    const initialForm = {
        uuid:"",
        name:"",
        description:"",
    }
    const [form,setForm] = useState(initialForm)
    const [moods, setMoods] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const loadMood = async () => {
        try {
            const mood = await getMoodByUuid(db, uuid);
            setForm(mood)
        } catch (error) {
            console.log(error)
        }
        
    };

    const fetchMoods = async () => {
        try {
          const moods = await getLocalMoods(db);
          setMoods(moods);
        } catch (error) {
          console.error("Failed to fetch moods:", error);
        }
        
      };

    useEffect(() => {
        if(uuid){
            loadMood()
        }
        fetchMoods()
    }, []);

    const handleSave = async () => {
        const name = form.name.trim();

        if (!name) {
            Alert.alert("Validation", "Mood name is required.");
            return;
        }

        const exists = moods.some(
            m =>
            m.uuid !== uuid &&
            m.name.trim().toLowerCase() === name.toLowerCase()
        );

        if (exists) {
            Alert.alert("Duplicate", "A mood with this name already exists.");
            return;
        }

        try {
            setLoading(true);
            await saveMoods(db, [form]);
            setForm(initialForm);
            router.back();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <View
        style={globalStyles.container}
        >
        <BodyText style={globalStyles.title}>
            {uuid ? "Edit Mood" : "Add Mood"}
        </BodyText>

            <Card >
                <View style={globalStyles.formGroup}>
                    <FormLabel>Mood Name</FormLabel>
                    <Input
                        placeholder="Enter title"
                        value={form?.name} 
                        onChangeText={(val) => handleChange("name",val)}
                    />
                </View>

                <View style={globalStyles.formGroup}>
                    <FormLabel>Description (Optional)</FormLabel>
                    <TextArea
                        placeholder="Describe what this mood feels like..."
                        value={form?.description} 
                        onChangeText={(val) => handleChange("description",val)}
                    />
                </View>
            </Card>

            <Pressable
                style={({ pressed }) => [
                    globalStyles.primaryBtn,
                ]}
                onPress={handleSave}
                disabled={loading}
            >
                <BodyText style={globalStyles.primaryBtnText}>
                    {loading ? "Saving..." : uuid ? "Update Mood" : "Save Mood"}
                </BodyText>
            </Pressable>
        </View>
    );
};

export default AddMood;
