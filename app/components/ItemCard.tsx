import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import ExpiryBadge from './ExpiryBadge';

export default function ItemCard({ item, color, onPress }: any) {

    return (
        <Pressable
            onPress={onPress}
            style={[
                styles.item,
                { borderLeftColor: color }
            ]}
        >

            <Text style={styles.name}>
                {item.name}
            </Text>

            <Text style={styles.meta}>
                Type: {item.type}
            </Text>

            <ExpiryBadge
                expiryDate={item.expiryDate}
            />

        </Pressable>
    );
}

const styles = StyleSheet.create({

    item: {
        padding: 15,
        marginBottom: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderLeftWidth: 6,

        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowRadius: 4,
        elevation: 2,
    },

    name: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },

    meta: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
    },

});
