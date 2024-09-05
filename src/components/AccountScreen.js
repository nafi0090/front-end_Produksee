import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ActivityIndicator, FlatList, ScrollView,
    TouchableOpacity, Alert, TextInput, Modal, Button, RefreshControl,
    Picker
} from 'react-native';
import axios from 'axios';

const AccountScreen = ({ navigation }) => {
    const [data, setData] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [packets, setPackets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
    const [depositModalVisible, setDepositModalVisible] = useState(false);
    const [newCustomerId, setNewCustomerId] = useState('');
    const [newBalance, setNewBalance] = useState('');
    const [newPacket, setNewPacket] = useState('');
    const [newStartDate, setNewStartDate] = useState('');
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // New state variables for withdraw and deposit modals
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawDate, setWithdrawDate] = useState('');
    const [depositAmount, setDepositAmount] = useState('');
    const [depositDate, setDepositDate] = useState('');
    const [currentAccountId, setCurrentAccountId] = useState(null);

    // New state variables for withdraw response
    const [withdrawResponse, setWithdrawResponse] = useState(null);
    const [showWithdrawResponseModal, setShowWithdrawResponseModal] = useState(false);

    useEffect(() => {
        fetchData(page);
        fetchCustomers();
        fetchPackets();
    }, [page]);

    const fetchData = (pageNumber) => {
        setLoading(true);
        axios.get(`https://backendbank-system-production.up.railway.app/v1/api/account?page=${pageNumber}`)
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

    const fetchCustomers = () => {
        axios.get('https://backendbank-system-production.up.railway.app/v1/api/customers')
            .then(response => {
                setCustomers(response.data.data);
            })
            .catch(error => {
                console.error(error);
            });
    };

    const fetchPackets = () => {
        axios.get('https://backendbank-system-production.up.railway.app/v1/api/deposito') // Replace with actual endpoint
            .then(response => {
                setPackets(response.data.data);
            })
            .catch(error => {
                console.error(error);
            });
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData(1);
    };

    const handleCreate = () => {
        setNewCustomerId('');
        setNewBalance('');
        setNewPacket('');
        setNewStartDate('');
        setSelectedAccount(null);
        setModalVisible(true);
    };

    const handleSubmit = () => {
        const accountData = {
            id_customer: newCustomerId,
            balance: newBalance,
            packet: newPacket,
            startdate: newStartDate,
        };

        if (selectedAccount) {
            axios.put(`https://backendbank-system-production.up.railway.app/v1/api/account/${selectedAccount.id}/update`, accountData)
                .then(response => {
                    fetchData(page);
                    setModalVisible(false);
                    Alert.alert('Success', 'Account updated successfully');
                })
                .catch(error => {
                    console.error(error);
                    Alert.alert('Error', 'Failed to update account');
                });
        } else {
            axios.post('https://backendbank-system-production.up.railway.app/v1/api/account/create', accountData)
                .then(response => {
                    fetchData(page);
                    setModalVisible(false);
                    Alert.alert('Success', 'Account created successfully');
                })
                .catch(error => {
                    console.error(error);
                    Alert.alert('Error', 'Failed to create account');
                });
        }
    };

    const handleUpdate = (account) => {
        setNewCustomerId(account.id_customer.toString());
        setNewBalance(account.balance.toString());
        setNewPacket(account.packet.toString());
        setNewStartDate(account.startdate);
        setSelectedAccount(account);
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        console.log(`Deleting account with ID: ${id}`);

        try {
            const response = await axios.delete(`https://backendbank-system-production.up.railway.app/v1/api/account/${id}/delete`);
            console.log('Delete response:', response);
            if (response.status === 200) {
                console.log('Refreshing data');
                await fetchData(page); // Refresh data after deletion
                Alert.alert('Success', 'Account deleted successfully');
            } else {
                console.log('Error status code:', response.status);
                Alert.alert('Error', `Failed to delete account: ${response.status}`);
            }
        } catch (error) {
            console.error('Delete error:', error);
            Alert.alert('Error', 'Failed to delete account');
        }
    };

    const handleWithdraw = () => {
        const withdrawData = {
            balance: withdrawAmount,
            withdrawdate: withdrawDate,
        };

        axios.put(`https://backendbank-system-production.up.railway.app/v1/api/account/${currentAccountId}/withdraw`, withdrawData)
            .then(response => {
                setWithdrawResponse(response.data.data);
                setWithdrawModalVisible(false);
                setShowWithdrawResponseModal(true);
                fetchData(page);
            })
            .catch(error => {
                console.error(error);
                Alert.alert('Error', 'Failed to withdraw');
            });
    };

    const handleDeposit = () => {
        const depositData = {
            balance: depositAmount,
            depositdate: depositDate,
        };

        console.log(depositData);

        axios.put(`https://backendbank-system-production.up.railway.app/v1/api/account/${currentAccountId}/deposit`, depositData)
            .then(response => {
                fetchData(page);
                setDepositModalVisible(false);
                Alert.alert('Success', 'Deposit successful');
            })
            .catch(error => {
                console.error(error);
                Alert.alert('Error', 'Failed to deposit');
            });
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
                    <Text style={styles.headerText}>Customer ID</Text>
                    <Text style={styles.headerText}>Balance</Text>
                    <Text style={styles.headerText}>Packet</Text>
                    <Text style={styles.headerText}>Start Date</Text>
                    <Text style={styles.headerText}>Actions</Text>
                </View>
                <FlatList
                    data={data}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item, index }) => (
                        <View style={styles.row}>
                            <Text style={styles.cell}>{index + 1}</Text>
                            <Text style={styles.cell}>{item.id}</Text>
                            <Text style={styles.cell}>{item.id_customer}</Text>
                            <Text style={styles.cell}>{item.balance}</Text>
                            <Text style={styles.cell}>{item.packet}</Text>
                            <Text style={styles.cell}>{new Date(item.startdate).toLocaleDateString()}</Text>
                            <View style={styles.actionButtons}>
                                <TouchableOpacity style={styles.button} onPress={() => handleUpdate(item)}>
                                    <Text style={styles.buttonText}>Update</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.button} onPress={() => handleDelete(item.id)}>
                                    <Text style={styles.buttonText}>Delete</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.button} onPress={() => { setCurrentAccountId(item.id); setWithdrawModalVisible(true); }}>
                                <Text style={styles.buttonText}>Withdraw</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.button} onPress={() => { setCurrentAccountId(item.id); setDepositModalVisible(true); }}>
                                    <Text style={styles.buttonText}>Deposit</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            </View>

            <View style={styles.pagination}>
                <TouchableOpacity onPress={() => handlePagination('prev')} disabled={page === 1}>
                    <Text style={styles.paginationText}>Previous</Text>
                </TouchableOpacity>
                <Text style={styles.paginationText}>{page} / {totalPages}</Text>
                <TouchableOpacity onPress={() => handlePagination('next')} disabled={page === totalPages}>
                    <Text style={styles.paginationText}>Next</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
                <Text style={styles.createButtonText}>Create Account</Text>
            </TouchableOpacity>
            
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Customer')}>
                    <Text style={styles.navButtonText}>Go to Customer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Deposit Type')}>
                    <Text style={styles.navButtonText}>Go to Deposit Type</Text>
                </TouchableOpacity>
            </View>


            {/* Create/Update Account Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{selectedAccount ? 'Update Account' : 'Create Account'}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Customer ID"
                            value={newCustomerId}
                            onChangeText={setNewCustomerId}
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Balance"
                            value={newBalance}
                            onChangeText={setNewBalance}
                            keyboardType="numeric"
                        />
                        <Picker
                            selectedValue={newPacket}
                            onValueChange={(itemValue) => setNewPacket(itemValue)}
                            style={styles.input}
                        >
                            {packets.map((packet) => (
                                <Picker.Item key={packet.id} label={packet.name} value={packet.id} />
                            ))}
                        </Picker>
                        <TextInput
                            style={styles.input}
                            placeholder="Start Date (YYYY-MM-DD)"
                            value={newStartDate}
                            onChangeText={setNewStartDate}
                        />
                        <Button title={selectedAccount ? 'Update' : 'Create'} onPress={handleSubmit} />
                        <Button title="Close" onPress={() => setModalVisible(false)} />
                    </View>
                </View>
            </Modal>

            {/* Withdraw Modal */}
            <Modal
                visible={withdrawModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setWithdrawModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Withdraw</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Amount"
                            value={withdrawAmount}
                            onChangeText={setWithdrawAmount}
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Withdraw Date (YYYY-MM-DD)"
                            value={withdrawDate}
                            onChangeText={setWithdrawDate}
                        />
                        <Button title="Withdraw" onPress={handleWithdraw} />
                        <Button title="Close" onPress={() => setWithdrawModalVisible(false)} />
                    </View>
                </View>
            </Modal>

            {/* Deposit Modal */}
            <Modal
                visible={depositModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setDepositModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Deposit</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Amount"
                            value={depositAmount}
                            onChangeText={setDepositAmount}
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Deposit Date (YYYY-MM-DD)"
                            value={depositDate}
                            onChangeText={setDepositDate}
                        />
                        <Button title="Deposit" onPress={handleDeposit} />
                        <Button title="Close" onPress={() => setDepositModalVisible(false)} />
                    </View>
                </View>
            </Modal>

            {/* Withdraw Response Modal */}
            <Modal
                visible={showWithdrawResponseModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowWithdrawResponseModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Withdraw Response</Text>
                        {withdrawResponse ? (
                            <View>
                                <Text>ID Customer: {withdrawResponse.query.id_customer}</Text>
                                <Text>Balance: {withdrawResponse.ending_balance}</Text>
                                <Text>Start Date: {withdrawResponse.query.startdate}</Text>
                            </View>
                        ) : (
                            <Text>No response data</Text>
                        )}
                        <Button title="Close" onPress={() => setShowWithdrawResponseModal(false)} />
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
    },
    table: {
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        backgroundColor: '#f2f2f2',
        padding: 10,
    },
    headerText: {
        flex: 1,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        padding: 10,
    },
    cell: {
        flex: 1,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    buttonText: {
        color: '#fff',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
    },
    paginationText: {
        fontSize: 16,
    },
    createButton: {
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 5,
        margin: 10,
    },
    createButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    input: {
        width: '100%',
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
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

export default AccountScreen;

