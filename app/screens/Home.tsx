import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Image, FlatList, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const CACHE_KEY = 'cached_meals_b';
const CACHE_TTL = 1000 * 60 * 60 * 24;
const PAGE_SIZE = 5;

export default function Home() {

    const navigation = useNavigation<any>();

    const [allMeals, setAllMeals] = useState<any[]>([]);
    const [visibleMeals, setVisibleMeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchMeals();
    }, []);

    const fetchMeals = async () => {
        setLoading(true);

        try {
            const cached = await AsyncStorage.getItem(CACHE_KEY);

            if (cached) {
                const { timestamp, meals } = JSON.parse(cached);

                if (Date.now() - timestamp < CACHE_TTL) {
                    setAllMeals(meals);
                    setVisibleMeals(meals.slice(0, PAGE_SIZE));
                    setLoading(false);
                    return;
                }
            }

            const response = await fetch(
                'https://www.themealdb.com/api/json/v1/1/search.php?f=b'
            );

            const data = await response.json();
            const meals = data.meals || [];

            await AsyncStorage.setItem(
                CACHE_KEY,
                JSON.stringify({ timestamp: Date.now(), meals })
            );

            setAllMeals(meals);
            setVisibleMeals(meals.slice(0, PAGE_SIZE));

        } catch (error) {
            console.log('fetchMeals error:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = useCallback(() => {
        if (loadingMore) return;

        const nextPage = page + 1;
        const nextSlice = allMeals.slice(0, nextPage * PAGE_SIZE);

        if (nextSlice.length === visibleMeals.length) return; // nothing new

        setLoadingMore(true);

        setTimeout(() => {
            setVisibleMeals(nextSlice);
            setPage(nextPage);
            setLoadingMore(false);
        }, 400);
    }, [page, allMeals, visibleMeals, loadingMore]);

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <ActivityIndicator
                style={{ marginVertical: 16 }}
                color="#2196F3"
            />
        );
    };

    return (
        <View style={styles.container}>

            <Text style={styles.title}>
                Wa make?
            </Text>

            <Pressable
                style={styles.button}
                onPress={() => navigation.navigate('MainDrawer')}
            >
                <Text style={styles.buttonText}>
                    Ga naar inventaris
                </Text>
            </Pressable>

            <Text style={styles.sectionTitle}>
                🍝 Suggesties van vandaag
            </Text>

            {loading ? (
                <ActivityIndicator
                    size="large"
                    color="#2196F3"
                    style={styles.loader}
                />
            ) : (
                <FlatList
                    data={visibleMeals}
                    keyExtractor={(item) => item.idMeal}
                    showsVerticalScrollIndicator={false}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={renderFooter}
                    renderItem={({ item }) => (

                        <View style={styles.card}>

                            <Image
                                source={{ uri: item.strMealThumb }}
                                style={styles.image}
                            />

                            <Text style={styles.mealName}>
                                {item.strMeal}
                            </Text>

                        </View>

                    )}
                />
            )}

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        padding: 60,
        backgroundColor: '#f5f5f5',
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },

    button: {
        backgroundColor: '#2196F3',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 25,
    },

    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },

    loader: {
        marginTop: 40,
    },

    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },

    image: {
        width: '100%',
        height: 180,
    },

    mealName: {
        fontSize: 17,
        fontWeight: 'bold',
        padding: 12,
    },

});
