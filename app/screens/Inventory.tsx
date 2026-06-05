import React, { useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { ItemContext } from '../context/ItemContext';
import ItemCard from '../components/ItemCard';
import FilterChip from '../components/FilterChip';

type Item = {
    id: string;
    name: string;
    type: string;
    expiryDate?: string;
};

export default function Inventory() {

    const { items } = useContext(ItemContext);
    const navigation = useNavigation<any>();

    const [filtersOpen, setFiltersOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('alles');
    const [typeFilter, setTypeFilter] = useState('alles');
    const [sortMode, setSortMode] = useState('Recent Toegevoegd');
    const [search, setSearch] = useState('');

    const filterHeight = useSharedValue(0);
    const filterOpacity = useSharedValue(0);
    const chevronRotation = useSharedValue(0);

    const toggleFilters = () => {
        const opening = !filtersOpen;
        setFiltersOpen(opening);

        filterHeight.value = withTiming(opening ? 1 : 0, {
            duration: 300,
            easing: Easing.inOut(Easing.ease),
        });

        filterOpacity.value = withTiming(opening ? 1 : 0, {
            duration: 250,
        });

        chevronRotation.value = withTiming(opening ? 1 : 0, {
            duration: 300,
        });
    };

    const animatedFilterStyle = useAnimatedStyle(() => ({
        maxHeight: filterHeight.value * 400,
        opacity: filterOpacity.value,
        overflow: 'hidden',
    }));

    const animatedChevronStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${chevronRotation.value * 180}deg` }],
    }));

    const getStatus = (expiryDate?: string) => {
        if (!expiryDate) return 'goed';

        const diffDays =
            (new Date(expiryDate).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24);

        if (diffDays < 0) return 'vervallen';
        if (diffDays <= 7) return 'vervalt binnenkort';
        return 'goed';
    };

    const getStatusColor = (expiryDate?: string) => {
        const status = getStatus(expiryDate);

        if (status === 'vervallen') return '#ff4d4d';
        if (status === 'vervalt binnenkort') return '#ffa500';
        return '#4caf50';
    };

    let filteredItems = [...items];

    if (search.trim()) {
        filteredItems = filteredItems.filter(item =>
            item.name.toLowerCase().includes(search.toLowerCase())
        );
    }

    if (statusFilter !== 'alles') {
        filteredItems = filteredItems.filter(
            item => getStatus(item.expiryDate) === statusFilter
        );
    }

    if (typeFilter !== 'alles') {
        filteredItems = filteredItems.filter(
            item => item.type === typeFilter
        );
    }

    if (sortMode === 'Vervaldatum') {
        filteredItems.sort(
            (a, b) =>
                new Date(a.expiryDate || 0).getTime() -
                new Date(b.expiryDate || 0).getTime()
        );
    }

    if (sortMode === 'A-Z') {
        filteredItems.sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    }

    const renderItem = ({ item }: { item: Item }) => (
        <ItemCard
            item={item}
            color={getStatusColor(item.expiryDate)}
            onPress={() =>
                navigation.navigate('ItemDetail', { item })
            }
        />
    );

    return (
        <View style={styles.container}>

            <TextInput
                style={styles.searchInput}
                placeholder="Zoek item..."
                value={search}
                onChangeText={setSearch}
            />

            <Pressable style={styles.filterHeader} onPress={toggleFilters}>
                <Text style={styles.filterHeaderText}>
                    Filters & sortering
                </Text>
                <Animated.Text style={animatedChevronStyle}>
                    ▾
                </Animated.Text>
            </Pressable>

            <Animated.View style={animatedFilterStyle}>

                <Text style={styles.filterTitle}>Status</Text>

                <View style={styles.filterRow}>
                    {['alles', 'goed', 'vervalt binnenkort', 'vervallen'].map(val => (
                        <FilterChip
                            key={val}
                            label={val}
                            active={statusFilter === val}
                            onPress={() => setStatusFilter(val)}
                        />
                    ))}
                </View>

                <Text style={styles.filterTitle}>Type</Text>

                <View style={styles.filterRow}>
                    {['alles', 'product', 'mealprep'].map(val => (
                        <FilterChip
                            key={val}
                            label={val}
                            active={typeFilter === val}
                            onPress={() => setTypeFilter(val)}
                        />
                    ))}
                </View>

                <Text style={styles.filterTitle}>Sorteren op:</Text>

                <View style={styles.filterRow}>
                    {['Recent Toegevoegd', 'A-Z', 'Vervaldatum'].map(val => (
                        <FilterChip
                            key={val}
                            label={val}
                            active={sortMode === val}
                            onPress={() => setSortMode(val)}
                        />
                    ))}
                </View>

            </Animated.View>

            <FlatList
                data={filteredItems}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 40 }}
            />

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },

    searchInput: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },

    filterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 10,
    },

    filterHeaderText: {
        fontWeight: 'bold',
    },

    filterTitle: {
        marginTop: 10,
        fontWeight: 'bold',
        fontSize: 12,
        color: '#888',
    },

    filterRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
});
