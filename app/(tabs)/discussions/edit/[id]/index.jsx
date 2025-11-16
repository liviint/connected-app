import { useLocalSearchParams } from 'expo-router';
import AddEditForm from '../../../../../src/components/discussions/AddEditForm'

const Index = () => {
    const { id } = useLocalSearchParams()
    return (
        <AddEditForm
            discussionId={id}
        />
    )
}

export default Index