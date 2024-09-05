import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, ScrollView, TouchableOpacity, Alert, TextInput, Modal, Button, RefreshControl } from 'react-native';
import axios from 'axios';

const DepositTypeScreen = ({ navigation }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newName, setNewName] = useState('');
    const [newYearlyReturn, setNewYearlyReturn] = useState('');
    const [isUpdate, setIsUpdate] = useState(false);
    const [selectedDepositType, setSelectedDepositType] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchData(page);
    }, [page]);

    const fetchData = (pageNumber) => {
        setLoading(true);
        axios.get(`https://backendbank-system-production.up.railway.app/v1/api/deposito?page=${pageNumber}`)
            .then(response => {
                setData(response.data.data);
                setTotalPages(response.data.totalPages);
                setLoading(false);
                setRefreshing(false);
            })
            .catch(error => {
                console.error(error);
                setLoading(false);
                setRefreshing(false);
            });
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData(1);
    };

    const handleCreate = () => {
        setNewName('');
        setNewYearlyReturn('');
        setSelectedDepositType(null);
        setIsUpdate(false);
        setModalVisible(true);
    };

    const handleSubmit = () => {
        const newDepositType = {
            name: newName,
            yearly_return: newYearlyReturn
        };

        if (isUpdate && selectedDepositType) {
            axios.put(`https://backendbank-system-production.up.railway.app/v1/api/deposito/${selectedDepositType.id}/update`, newDepositType)
                .then(response => {
                    fetchData(page);
                    setNewName('');
                    setNewYearlyReturn('');
                    setSelectedDepositType(null);
                    setModalVisible(false);
                    Alert.alert('Success', 'Deposit Type updated successfully');
                })
                .catch(error => {
                    console.error(error);
                    Alert.alert('Error', 'Failed to update Deposit Type');
                });
        } else {
            axios.post('https://backendbank-system-production.up.railway.app/v1/api/deposito/create', newDepositType)
                .then(response => {
                    fetchData(page);
                    setNewName('');
                    setNewYearlyReturn('');
                    setModalVisible(false);
                    Alert.alert('Success', 'Deposit Type added successfully');
                })
                .catch(error => {
                    console.error(error);
                    Alert.alert('Error', 'Failed to add Deposit Type');
                });
        }
    };

    const handleUpdate = (depositType) => {
        setNewName(depositType.name);
        setNewYearlyReturn(depositType.yearly_return.toString());
        setSelectedDepositType(depositType);
        setIsUpdate(true);
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        console.log(`Deleting Deposit Type with ID: ${id}`);

        try {
            const response = await axios.delete(`https://backendbank-system-production.up.railway.app/v1/api/deposito/${id}/delete`);
            console.log('Delete response:', response);
            if (response.status === 200) {
                console.log('Refreshing data');
                await fetchData(page); // Refresh data after deletion
                Alert.alert('Success', 'Deposit Type deleted successfully');
            } else {
                console.log('Error status code:', response.status);
                Alert.alert('Error', `Failed to delete Deposit Type: ${response.status}`);
            }
        } catch (error) {
            console.error('Delete error:', error);
            Alert.alert('Error', 'Failed to delete Deposit Type');
        }
    };

    const handlePagination = (direction) => {
        if (direction === 'next' && page < totalPages) {
            setPage(page + 1);
        } else if (direction === 'prev' && page > 1) {
            setPage(page - 1);
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <ScrollView
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={styles.container}
        >
            <View style={styles.table}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>No.</Text>
                    <Text style={styles.headerText}>ID</Text>
                    <Text style={styles.headerText}>Name</Text>
                    <Text style={styles.headerText}>Yearly Return</Text>
                    <Text style={styles.headerText}>Actions</Text>
                </View>
                <FlatList
                    data={data}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item, index }) => (
                        <View style={styles.row}>
                            <Text style={styles.cell}>{index + 1}</Text>
                            <Text style={styles.cell}>{item.id}</Text>
                            <Text style={styles.cell}>{item.name}</Text>
                            <Text style={styles.cell}>{item.yearly_return}%</Text>
                            <View style={styles.actionButtons}>
                                <TouchableOpacity style={styles.button} onPress={() => handleUpdate(item)}>
                                    <Text style={styles.buttonText}>Update</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.button} onPress={() => handleDelete(item.id)}>
                                    <Text style={styles.buttonText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
                <View style={styles.pagination}>
                    <Button title="Previous" onPress={() => handlePagination('prev')} disabled={page === 1} />
                    <Text style={styles.pageNumber}>Page {page} of {totalPages}</Text>
                    <Button title="Next" onPress={() => handlePagination('next')} disabled={page === totalPages} />
                </View>
                <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
                    <Text style={styles.createButtonText}>Create New</Text>
                </TouchableOpacity>
            </View>
            
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Account')}>
                    <Text style={styles.navButtonText}>Go to Account</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Customer')}>
                    <Text style={styles.navButtonText}>Go to Customer</Text>
                </TouchableOpacity>
            </View>

            {/* Modal for Create/Update */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{isUpdate ? 'Update Deposit Type' : 'Add New Deposit Type'}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter name"
                            value={newName}
                            onChangeText={setNewName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter yearly return"
                            keyboardType="numeric"
                            value={newYearlyReturn}
                            onChangeText={setNewYearlyReturn}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalButton} onPress={handleSubmit}>
                                <Text style={styles.modalButtonText}>{isUpdate ? 'Update' : 'Submit'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f9f9f9',
    },
    table: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        overflow: 'hidden',
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        backgroundColor: '#4CAF50',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingVertical: 8,
    },
    headerText: {
        flex: 1,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 14,
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingVertical: 8,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    cell: {
        flex: 1,
        padding: 8,
        textAlign: 'center',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    createButton: {
        padding: 12,
        backgroundColor: '#28a745',
        borderRadius: 8,
        marginTop: 16,
        alignItems: 'center',
    },
    createButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
    },
    pageNumber: {
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        width: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        padding: 8,
        marginBottom: 12,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        backgroundColor: '#007bff',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
    },
    modalButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    buttonContainer: {
        marginTop: 16,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    navButton: {
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 4,
    },
    navButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default DepositTypeScreen;

       
