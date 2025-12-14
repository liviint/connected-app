import { Stack } from 'expo-router';

export default function JournalStackLayout() {
    return (
        <Stack screenOptions={{
            headerShown: false, 
        }}>
            <Stack.Screen 
                name="index" 
                options={{ title: 'Journal Overview' }} 
            />
            <Stack.Screen 
                name="[id]/index" 
                options={{ title: 'View Entry' }} 
            />
            
            <Stack.Screen 
                name="create/index" 
                options={{ title: 'New Entry' }} 
            />
        </Stack>
    );
}