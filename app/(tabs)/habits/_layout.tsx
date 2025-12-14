import { Stack } from 'expo-router';

export default function HabitsStackLayout() {
    return (
        <Stack screenOptions={{
            headerShown: false, 
        }}>
            <Stack.Screen 
                name="index" 
                options={{ title: 'Habits Overview' }} 
            />
            <Stack.Screen 
                name="[id]/edit/index" 
                options={{ title: 'View Entry' }} 
            />
            
            <Stack.Screen 
                name="add/index" 
                options={{ title: 'New Entry' }} 
            />
            <Stack.Screen 
                name="entries/index" 
                options={{ title: 'New Entry' }} 
            />
            <Stack.Screen 
                name="[id]/stats/index" 
                options={{ title: 'New Entry' }} 
            />
        </Stack>
    );
}