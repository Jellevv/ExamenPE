import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

export default function FilterChip({ label, active, onPress }: any) {

    return (
        <Pressable
            style={[
                styles.button,
                active && styles.active
            ]}
            onPress={onPress}
        >
            <Text
                style={[
                    styles.text,
                    active && styles.activeText
                ]}
            >
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({

    button: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: '#fff',
    },

    text: {
        fontSize: 14,
        color: '#333',
    },

    active: {
        backgroundColor: '#2196F3',
        borderColor: '#2196F3',
    },

    activeText: {
        color: '#fff',
        fontWeight: 'bold',
    },

});
