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
    const [loading, setLoading] = useState(false);

    const handleChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const loadMood = async () => {
        try {
            const mood = await getMoodByUuid(db, uuid);
            console.log(mood,"hello mood")
            setForm(mood)
        } catch (error) {
            console.log(error)
        }
        
    };

    useEffect(() => {
        uuid && loadMood()
    }, []);

    const handleSave = async () => {
        if (!form.name.trim()) {
            Alert.alert("Validation", "Mood name is required.");
            return;
        }

        try {
            setLoading(true);
            await saveMoods(db,[form])
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
