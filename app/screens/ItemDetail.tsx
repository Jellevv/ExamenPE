import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ItemContext } from '../context/ItemContext';

export default function ItemDetail({ route, navigation }: any) {

    const { item } = route.params;

    const {
        updateItem,
        deleteItem
    } = useContext(ItemContext);

    const [name, setName] = useState(item.name);
    const [type, setType] = useState(item.type);
    const [date, setDate] = useState(new Date(item.expiryDate));
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleUpdate = () => {

        const updatedItem = {
            ...item,
            name,
            type,
            expiryDate: date.toISOString(),
        };

        updateItem(updatedItem);

        navigation.goBack();
    };

    const handleDelete = () => {

        deleteItem(item.id);

        navigation.goBack();
    };

    return (
        <View style={styles.container}>

            <Text style={styles.title}>
                Item bewerken
            </Text>

            <TextInput
                value={name}
                onChangeText={setName}
                style={styles.input}
            />

            <View style={styles.pickerBox}>
                <Picker
                    selectedValue={type}
                    onValueChange={(value) => setType(value)}
                >
                    <Picker.Item label="Product" value="product" />
                    <Picker.Item label="Meal-prep" value="mealprep" />
                </Picker>
            </View>

            <Pressable
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
            >
                <Text>
                    {date.toLocaleDateString('nl-BE')}
                </Text>
            </Pressable>

            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) setDate(selectedDate);
                    }}
                />
            )}

            <Pressable
                style={styles.saveButton}
                onPress={handleUpdate}
            >
                <Text style={styles.buttonText}>
                    Opslaan
                </Text>
            </Pressable>

            <Pressable
                style={styles.deleteButton}
                onPress={handleDelete}
            >
                <Text style={styles.buttonText}>
                    Verwijderen
                </Text>
            </Pressable>

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        padding: 20,
    },

    title: {
        fontSize: 22,
        marginBottom: 20,
    },

    input: {
        borderWidth: 1,
        padding: 15,
        marginBottom: 15,
        fontSize: 16,
    },

    pickerBox: {
        borderWidth: 1,
        marginBottom: 20,
    },

    dateButton: {
        padding: 15,
        borderWidth: 1,
        marginBottom: 20,
    },

    saveButton: {
        backgroundColor: '#4caf50',
        padding: 18,
        alignItems: 'center',
        marginBottom: 10,
        borderRadius: 8,
    },

    deleteButton: {
        backgroundColor: '#ff4d4d',
        padding: 18,
        alignItems: 'center',
        borderRadius: 8,
    },

    buttonText: {
        color: '#fff',
        fontSize: 16,
    },

});
