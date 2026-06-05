import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ItemContext } from '../context/ItemContext';

export default function AddItem() {
    const { addItem: addNewItem } = useContext(ItemContext); const [name, setName] = useState('');
    const [type, setType] = useState('product');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const addItem = () => {
        if (!name) return;

        const newItem = {
            id: Math.random().toString(),
            name,
            type,
            expiryDate: date.toISOString(),
        };

        addNewItem(newItem);
        setSuccessMessage(`✔ ${name} toegevoegd`);
         setTimeout(() => {
            setSuccessMessage(null);
        }, 2000);
        setName('');
        setType('product');
        setDate(new Date());
    };

    return (
        <View style={styles.container}>

            {successMessage && (
                <View style={styles.successBox}>
                    <Text style={styles.successText}>
                        {successMessage}
                    </Text>
                </View>
            )}

            <TextInput
                placeholder="Naam"
                value={name}
                onChangeText={setName}
                style={styles.input}
            />

            <Text style={styles.label}>Type</Text>
            <View style={styles.pickerBox}>
                <Picker
                    selectedValue={type}
                    onValueChange={(value) => setType(value)}
                    style={styles.picker}
                >
                    <Picker.Item label="Product" value="product" />
                    <Picker.Item label="Meal-prep" value="mealprep" />
                </Picker>
            </View>

            {/* Date picker */}
            <Text style={styles.label}>Vervaldatum</Text>

            <Pressable
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
            >
                <Text style={styles.dateText}>
                    {date.toDateString()}
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

            <Pressable style={styles.button} onPress={addItem}>
                <Text style={styles.buttonText}>Toevoegen</Text>
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
        fontSize: 16,
        marginBottom: 15,
    },

    label: {
        fontSize: 16,
        marginTop: 10,
        marginBottom: 5,
    },

    pickerBox: {
        borderWidth: 1,
        marginBottom: 20,
        borderRadius: 8,
    },

    picker: {
        height: 60,
    },

    dateButton: {
        padding: 15,
        borderWidth: 1,
        marginBottom: 20,
        borderRadius: 8,
    },

    dateText: {
        fontSize: 16,
    },

    button: {
        backgroundColor: '#2196F3',
        padding: 18,
        borderRadius: 8,
        alignItems: 'center',
    },

    buttonText: {
        color: '#fff',
        fontSize: 16,
    },

    successBox: {
        backgroundColor: '#4caf50',
        padding: 8,
        borderRadius: 8,
        marginBottom: 15,
        maxWidth: 150,
        alignSelf: 'center',
    },

    successText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
