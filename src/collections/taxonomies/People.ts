import { CollectionConfig } from 'payload';
import { BaseEntry } from '@/shared';

export const People: CollectionConfig = {
    slug: 'people',
    admin: {
        useAsTitle: 'title',
    },
    fields: BaseEntry({
        typeHandle: [{ value: 'sectionPeople', label: 'People' }],
        url: { enabled: false },
    }),
};
