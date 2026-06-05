import React from 'react';
import { Text } from 'react-native';

export default function ExpiryBadge({ expiryDate }: { expiryDate?: string; }) {

    if (!expiryDate) {
        return (
            <Text>
                Geen vervaldatum
            </Text>
        );
    }

    const expiry = new Date(expiryDate);

    const diffDays = Math.ceil(
        (expiry.getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
    );

    const formattedDate =
        expiry.toLocaleDateString('nl-BE', {
            weekday: 'short',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });

    if (diffDays < 0) {
        return (
            <Text>
                {formattedDate} (vervallen)
            </Text>
        );
    }

    if (diffDays <= 7) {
        return (
            <Text>
                {formattedDate} (vervalt over {diffDays} dagen)
            </Text>
        );
    }

    return (
        <Text>
            {formattedDate}
        </Text>
    );
}

