import { Link, useNavigation, useRouter } from 'expo-router';
import React, { useLayoutEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Switch,
    SafeAreaView,
    Pressable,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Path, Svg } from 'react-native-svg';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';

export default function ProfileScreen() {
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // Profile data state
    const [profileData, setProfileData] = useState({
        name: 'Sophia Carter',
        email: 'sophia.carter@email.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main St, Anytown, USA',
    });

    // Edit form states
    const [editData, setEditData] = useState({});
    const [currentEditField, setCurrentEditField] = useState('');

    const navigation = useNavigation();
    
    // Action sheet refs
    const nameActionSheetRef = useRef(null);
    const emailActionSheetRef = useRef(null);
    const phoneActionSheetRef = useRef(null);
    const addressActionSheetRef = useRef(null);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <Text className="text-2xl font-grotesk-bold text-[#121516]">PROFILE</Text>
            ),
            headerTitleAlign: 'center',
        });
    }, [navigation]);

    const openEditSheet = (field) => {
        setCurrentEditField(field);
        setEditData({ [field]: profileData[field] });
        
        switch (field) {
            case 'name':
                nameActionSheetRef.current?.show();
                break;
            case 'email':
                emailActionSheetRef.current?.show();
                break;
            case 'phone':
                phoneActionSheetRef.current?.show();
                break;
            case 'address':
                addressActionSheetRef.current?.show();
                break;
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Update profile data
            setProfileData(prev => ({
                ...prev,
                [currentEditField]: editData[currentEditField]
            }));
            
            // Close action sheet
            switch (currentEditField) {
                case 'name':
                    nameActionSheetRef.current?.hide();
                    break;
                case 'email':
                    emailActionSheetRef.current?.hide();
                    break;
                case 'phone':
                    phoneActionSheetRef.current?.hide();
                    break;
                case 'address':
                    addressActionSheetRef.current?.hide();
                    break;
            }
            
            Alert.alert('Success', `${currentEditField.charAt(0).toUpperCase() + currentEditField.slice(1)} updated successfully!`);
        } catch (error) {
            Alert.alert('Error', 'Failed to update. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const EditIcon = () => (
        <Svg width={16} height={16} viewBox="0 0 256 256" fill="#687b82">
            <Path d="M227.31,73.37,182.63,28.69a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96A16,16,0,0,0,227.31,73.37ZM92.69,208H48V163.31L136,75.31,180.69,120ZM192,108.69,147.31,64l24-24L216,84.69Z" />
        </Svg>
    );

    const renderActionSheet = (field: string, placeholder: string, keyboardType = 'default') => {
        const actionSheetRef = field === 'name' ? nameActionSheetRef :
                             field === 'email' ? emailActionSheetRef :
                             field === 'phone' ? phoneActionSheetRef :
                             addressActionSheetRef;

        return (
            <ActionSheet
                ref={actionSheetRef}
                containerStyle={{
                    backgroundColor: 'white',
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                }}
                gestureEnabled
                closeOnTouchBackdrop
            >
                <View className="p-6">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-grotesk-bold text-[#121517]">
                            Edit {field.charAt(0).toUpperCase() + field.slice(1)}
                        </Text>
                        <TouchableOpacity
                            onPress={() => actionSheetRef.current?.hide()}
                            className="w-8 h-8 items-center justify-center"
                        >
                            <Svg width={20} height={20} viewBox="0 0 256 256" fill="#687b82">
                                <Path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
                            </Svg>
                        </TouchableOpacity>
                    </View>

                    <View className="mb-6">
                        <Text className="text-base font-grotesk-medium text-[#121517] mb-2">
                            {placeholder}
                        </Text>
                        <TextInput
                            value={editData[field] || ''}
                            onChangeText={(text) => setEditData(prev => ({ ...prev, [field]: text }))}
                            placeholder={placeholder}
                            keyboardType={keyboardType}
                            className="border border-[#e1e5e7] rounded-lg px-4 py-3 text-base font-grotesk text-[#121517]"
                            autoFocus
                        />
                    </View>

                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={() => actionSheetRef.current?.hide()}
                            className="flex-1 py-3 px-4 rounded-lg border border-[#e1e5e7] items-center justify-center"
                        >
                            <Text className="text-base font-grotesk-medium text-[#687b82]">Cancel</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={isLoading || !editData[field]?.trim()}
                            className={`flex-1 py-3 px-4 rounded-lg items-center justify-center ${
                                isLoading || !editData[field]?.trim() 
                                    ? 'bg-[#e1e5e7]' 
                                    : 'bg-[#3a9dc4]'
                            }`}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Text className="text-base font-grotesk-medium text-white">Save</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ActionSheet>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1">
                {/* Profile Section */}
                <View className="p-4">
                    <View className="w-full flex-col gap-4 items-center">
                        <View className="gap-4 flex-col items-center">
                            <Image
                                source={{
                                    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkScOdeu2JDWF-QEj7Xdqp4L7lfTX_4PpNs58DNmuq6ZS3Z6KV7n_jgpCzQ-QgB5emQP3JbX8aBDG4imeweeVd5ch-4mgk69Inu9lDHk8JdWOVx2kQIiXdbq6Ks3JFAnchqmg3pxVTB7oWmGVg5l8T0uvzBHdwHffkO0wkWijFh77u1804S-6fHdxQFq5unVzRDyh7awb84uaA8yvMgwCizMi8rec2AKQ4DXhHG17-jI_rnk47q3bIXlQiKi4Wa2yyQ_xDmc-9pQ',
                                }}
                                className="w-32 h-32 rounded-full"
                                resizeMode="cover"
                            />
                            <View className="flex-col items-center justify-center">
                                <View className="flex-row items-center gap-2">
                                    <Text className="text-[#121517] text-3xl font-grotesk-bold text-center">
                                        {profileData.name}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => openEditSheet('name')}
                                        className="p-1"
                                    >
                                        <EditIcon />
                                    </TouchableOpacity>
                                </View>
                                <Text className="text-[#687b82] text-base font-grotesk-medium text-center">
                                    Member since 2022
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Account Section */}
                <Text className="text-[#121517] text-2xl font-grotesk-bold px-4 pb-2 pt-4">
                    Account
                </Text>

                {/* Email */}
                <View className="flex-row items-center gap-4 bg-white px-4 min-h-[72px] py-2">
                    <View className="w-12 h-12 items-center justify-center rounded-lg bg-[#f1f3f4]">
                        <Svg width={24} height={24} viewBox="0 0 256 256" fill="#121517">
                            <Path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48Zm-96,85.15L52.57,64H203.43ZM98.71,128,40,181.81V74.19Zm11.84,10.85,12,11.05a8,8,0,0,0,10.82,0l12-11.05,58,53.15H52.57ZM157.29,128,216,74.18V181.82Z" />
                        </Svg>
                    </View>
                    <View className="flex-col justify-center flex-1">
                        <Text className="text-[#121517] text-xl font-grotesk-medium">Email</Text>
                        <Text style={{ color: '#697A82' }} className="text-base font-grotesk">
                            {profileData.email}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => openEditSheet('email')}
                        className="p-2"
                    >
                        <EditIcon />
                    </TouchableOpacity>
                </View>

                {/* Phone */}
                <View className="flex-row items-center gap-4 bg-white px-4 min-h-[72px] py-2">
                    <View className="w-12 h-12 items-center justify-center rounded-lg bg-[#f1f3f4]">
                        <Svg width={24} height={24} viewBox="0 0 256 256" fill="#121517">
                            <Path d="M222.37,158.46l-47.11-21.11-.13-.06a16,16,0,0,0-15.17,1.4,8.12,8.12,0,0,0-.75.56L134.87,160c-15.42-7.49-31.34-23.29-38.83-38.51l20.78-24.71c.2-.25.39-.5.57-.77a16,16,0,0,0,1.32-15.06l0-.12L97.54,33.64a16,16,0,0,0-16.62-9.52A56.26,56.26,0,0,0,32,80c0,79.4,64.6,144,144,144a56.26,56.26,0,0,0,55.88-48.92A16,16,0,0,0,222.37,158.46ZM176,208A128.14,128.14,0,0,1,48,80,40.2,40.2,0,0,1,82.87,40a.61.61,0,0,0,0,.12l21,47L83.2,111.86a6.13,6.13,0,0,0-.57.77,16,16,0,0,0-1,15.7c9.06,18.53,27.73,37.06,46.46,46.11a16,16,0,0,0,15.75-1.14,8.44,8.44,0,0,0,.74-.56L168.89,152l47,21.05h0s.08,0,.11,0A40.21,40.21,0,0,1,176,208Z" />
                        </Svg>
                    </View>
                    <View className="flex-col justify-center flex-1">
                        <Text className="text-[#121517] text-xl font-grotesk-medium">Phone</Text>
                        <Text className="text-[#687b82] text-sm">{profileData.phone}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => openEditSheet('phone')}
                        className="p-2"
                    >
                        <EditIcon />
                    </TouchableOpacity>
                </View>

                {/* Address */}
                <View className="flex-row items-center gap-4 bg-white px-4 min-h-[72px] py-2">
                    <View className="w-12 h-12 items-center justify-center rounded-lg bg-[#f1f3f4]">
                        <Svg width={24} height={24} viewBox="0 0 256 256" fill="#121517">
                            <Path d="M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z" />
                        </Svg>
                    </View>
                    <View className="flex-col justify-center flex-1">
                        <Text className="text-[#121517] text-xl font-grotesk-medium">Address</Text>
                        <Text className="text-[#687b82] text-sm">
                            {profileData.address}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => openEditSheet('address')}
                        className="p-2"
                    >
                        <EditIcon />
                    </TouchableOpacity>
                </View>

                {/* Payment Method */}
                <View className="flex-row items-center gap-4 bg-white px-4 min-h-[72px] py-2">
                    <View className="w-12 h-12 items-center justify-center rounded-lg bg-[#f1f3f4]">
                        <Svg width={24} height={24} viewBox="0 0 256 256" fill="#121517">
                            <Path d="M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48Zm0,16V88H32V64Zm0,128H32V104H224v88Zm-16-24a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h32A8,8,0,0,1,208,168Zm-64,0a8,8,0,0,1-8,8H120a8,8,0,0,1,0-16h16A8,8,0,0,1,144,168Z" />
                        </Svg>
                    </View>
                    <View className="flex-col justify-center flex-1">
                        <Text className="text-[#121517] text-xl font-grotesk-medium">
                            Payment Method
                        </Text>
                        <Text className="text-[#687b82] text-sm">Visa **** 1234</Text>
                    </View>
                </View>

                {/* Settings Section */}
                <Text className="text-[#121517] text-2xl font-grotesk-bold px-4 pb-2 pt-4">
                    Settings
                </Text>

                {/* Notifications */}
                <View className="flex-row items-center gap-4 bg-white px-4 min-h-14 justify-between">
                    <View className="flex-row items-center gap-4 flex-1">
                        <View className="w-10 h-10 items-center justify-center rounded-lg bg-[#f1f3f4]">
                            <Svg width={24} height={24} viewBox="0 0 256 256" fill="#121517">
                                <Path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z" />
                            </Svg>
                        </View>
                        <Text className="text-[#121517] text-xl font-grotesk-medium flex-1">
                            Notifications
                        </Text>
                    </View>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={setNotificationsEnabled}
                        trackColor={{ false: '#f1f3f4', true: '#3a9dc4' }}
                        thumbColor="#ffffff"
                    />
                </View>

                {/* Language */}
                <View className="flex-row items-center gap-4 bg-white px-4 min-h-14 justify-between">
                    <View className="flex-row items-center gap-4 flex-1">
                        <View className="w-10 h-10 items-center justify-center rounded-lg bg-[#f1f3f4]">
                            <Svg width={24} height={24} viewBox="0 0 256 256" fill="#121517">
                                <Path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM101.63,168h52.74C149,186.34,140,202.87,128,215.89,116,202.87,107,186.34,101.63,168ZM98,152a145.72,145.72,0,0,1,0-48h60a145.72,145.72,0,0,1,0,48ZM40,128a87.61,87.61,0,0,1,3.33-24H81.79a161.79,161.79,0,0,0,0,48H43.33A87.61,87.61,0,0,1,40,128ZM154.37,88H101.63C107,69.66,116,53.13,128,40.11,140,53.13,149,69.66,154.37,88Zm19.84,16h38.46a88.15,88.15,0,0,1,0,48H174.21a161.79,161.79,0,0,0,0-48Zm32.16-16H170.94a142.39,142.39,0,0,0-20.26-45A88.37,88.37,0,0,1,206.37,88ZM105.32,43A142.39,142.39,0,0,0,85.06,88H49.63A88.37,88.37,0,0,1,105.32,43ZM49.63,168H85.06a142.39,142.39,0,0,0,20.26,45A88.37,88.37,0,0,1,49.63,168Zm101.05,45a142.39,142.39,0,0,0,20.26-45h35.43A88.37,88.37,0,0,1,150.68,213Z" />
                            </Svg>
                        </View>
                        <Text className="text-[#121517] text-xl font-grotesk-medium flex-1">Language</Text>
                    </View>
                    <Text className="text-[#121517] text-xl font-grotesk">English</Text>
                </View>

                {/* Manage Subscription */}
                <TouchableOpacity className="flex-row items-center gap-4 bg-white px-4 min-h-14 justify-between">
                    <View className="flex-row items-center gap-4 flex-1">
                        <View className="w-10 h-10 items-center justify-center rounded-lg bg-[#f1f3f4]">
                            <Svg width={24} height={24} viewBox="0 0 256 256" fill="#121517">
                                <Path d="M24,128A72.08,72.08,0,0,1,96,56H204.69L194.34,45.66a8,8,0,0,1,11.32-11.32l24,24a8,8,0,0,1,0,11.32l-24,24a8,8,0,0,1-11.32-11.32L204.69,72H96a56.06,56.06,0,0,0-56,56,8,8,0,0,1-16,0Zm200-8a8,8,0,0,0-8,8,56.06,56.06,0,0,1-56,56H51.31l10.35-10.34a8,8,0,0,0-11.32-11.32l-24,24a8,8,0,0,0,0,11.32l24,24a8,8,0,0,0,11.32-11.32L51.31,200H160a72.08,72.08,0,0,0,72-72A8,8,0,0,0,224,120Z" />
                            </Svg>
                        </View>
                        <Link href={{ pathname: '/orders' }} className='flex-row items-center justify-center'>
                            <Text className="text-[#121517] text-xl font-grotesk-medium flex-1">Manage Subscription</Text>
                        </Link>
                    </View>
                </TouchableOpacity>
            </ScrollView>

            {/* Action Sheets */}
            {renderActionSheet('name', 'Enter your full name')}
            {renderActionSheet('email', 'Enter your email address', 'email-address')}
            {renderActionSheet('phone', 'Enter your phone number', 'phone-pad')}
            {renderActionSheet('address', 'Enter your address')}

            {/* Bottom spacing */}
            <View className="h-5 bg-white" />
        </SafeAreaView>
    );
}