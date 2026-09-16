import { useState, useEffect } from 'react';
import axios from '../../../api';

export const useFormLists = () => {
    const [lists, setLists] = useState({
        personList: [],
        incomeList: [],
        spentList: []
    });

    useEffect(() => {
        const fetchLists = async () => {
            try {
                const [incomeResponse, spentResponse, personResponse] = await Promise.all([
                    axios.get('/incomelists'),
                    axios.get('/spentlists'),
                    axios.get('/persons/active')
                ]);

                setLists({
                    incomeList: incomeResponse.data,
                    spentList: spentResponse.data,
                    personList: personResponse.data
                });
            } catch (error) {
                console.error('Error fetching lists:', error);
            }
        };

        fetchLists();
    }, []);

    return lists;
};
