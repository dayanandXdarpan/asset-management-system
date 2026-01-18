import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { api } from '../services/api';

export const useAssets = (page = 1, limit = 10, search = '') => {
    return useQuery({
        queryKey: ['assets', page, limit, search],
        queryFn: () => api.get(`/assets?page=${page}&limit=${limit}&search=${search}`),
        placeholderData: keepPreviousData,
    });
};

export const useCreateAsset = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => api.createAsset(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assets'] });
        }
    });
};

export const useAsset = (id: number) => {
    return useQuery({
        queryKey: ['asset', id],
        queryFn: (() => api.getAsset(id)) as any,
        enabled: !!id
    });
};
