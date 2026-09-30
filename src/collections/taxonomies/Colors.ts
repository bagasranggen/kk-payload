import { CollectionConfig } from 'payload';

import { BaseEntry } from '@/shared';

export const Colors: CollectionConfig = {
    slug: 'colors',
    admin: {
        group: 'Merchandise',
        useAsTitle: 'title',
    },
    fields: BaseEntry({
        url: { enabled: false },
        tabs: [],
    }),
};
