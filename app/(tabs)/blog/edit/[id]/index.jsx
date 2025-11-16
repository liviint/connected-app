import { Text, ScrollView } from 'react-native';
import AddEditBlogForm from '../../../../../src/components/blogs/AddEditBlogForm';
import { useLocalSearchParams } from 'expo-router';
import { globalStyles } from '../../../../../src/styles/global';

export default function EditBlogPage() {
    const { id } = useLocalSearchParams()

    return (
        <ScrollView style={globalStyles.container}>
            <Text style={globalStyles.title}>{id ? 'Edit Blog' : 'Add New Blog'}</Text>
            <AddEditBlogForm blogId={id} />
        </ScrollView>
    );
}
