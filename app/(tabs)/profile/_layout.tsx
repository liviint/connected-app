import { Stack } from 'expo-router';

export default function HabitsStackLayout() {
    return (
        <Stack screenOptions={{
            headerShown: false, 
        }}>
            <Stack.Screen 
                name="index" 
                options={{ title: 'Profile' }} 
            />
            <Stack.Screen 
                name="edit/index" 
                options={{ title: 'View Entry' }} 
            />
        </Stack>
    );
}