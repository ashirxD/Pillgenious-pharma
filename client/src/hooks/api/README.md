# React Query API Hooks

This directory contains all React Query hooks for API calls throughout the application.

## 📁 Structure

```
hooks/api/
├── index.js              # Barrel export for all hooks
├── useAuth.js            # Authentication hooks
├── useDrugs.js           # Drugs/Medicines hooks
├── useOrders.js          # Orders and Cart hooks
├── usePrescriptions.js   # Prescriptions hooks
└── useNotifications.js   # Notifications hooks
```

## 🔧 Usage

### Authentication Hooks (`useAuth.js`)

#### Login
```jsx
import { useLogin } from '../../hooks/api/useAuth';

function LoginComponent() {
  const loginMutation = useLogin();

  const handleLogin = () => {
    loginMutation.mutate({ 
      email: 'user@example.com', 
      password: 'password' 
    });
  };

  return (
    <button 
      onClick={handleLogin}
      disabled={loginMutation.isPending}
    >
      {loginMutation.isPending ? 'Logging in...' : 'Login'}
    </button>
  );
}
```

#### Register
```jsx
import { useRegister } from '../../hooks/api/useAuth';

const registerMutation = useRegister();

registerMutation.mutate({ 
  name: 'John Doe',
  email: 'john@example.com', 
  password: 'password123' 
});
```

#### Logout
```jsx
import { useLogout } from '../../hooks/api/useAuth';

const logoutMutation = useLogout();
logoutMutation.mutate(); // Clears auth and redirects to login
```

---

### Drugs/Medicines Hooks (`useDrugs.js`)

#### Fetch All Drugs
```jsx
import { useDrugs } from '../../hooks/api/useDrugs';

function DrugsList() {
  const { data: drugs, isLoading, isError, error } = useDrugs();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {drugs.map(drug => (
        <li key={drug.id}>{drug.name}</li>
      ))}
    </ul>
  );
}
```

#### Fetch with Filters
```jsx
const { data: drugs } = useDrugs({ 
  category: 'antibiotics', 
  inStock: true 
});
```

#### Fetch Single Drug
```jsx
import { useDrug } from '../../hooks/api/useDrugs';

const { data: drug } = useDrug(drugId);
```

#### Search Drugs
```jsx
import { useSearchDrugs } from '../../hooks/api/useDrugs';

const { data: results } = useSearchDrugs(searchQuery);
// Only searches if query length >= 2
```

#### Create Drug (Admin)
```jsx
import { useCreateDrug } from '../../hooks/api/useDrugs';

const createMutation = useCreateDrug();

createMutation.mutate({
  name: 'Aspirin 500mg',
  category: 'Pain Relief',
  price: 9.99,
  stock: 100
});
```

#### Update Drug
```jsx
import { useUpdateDrug } from '../../hooks/api/useDrugs';

const updateMutation = useUpdateDrug();

updateMutation.mutate({
  id: 123,
  drugData: { price: 12.99, stock: 50 }
});
```

#### Delete Drug
```jsx
import { useDeleteDrug } from '../../hooks/api/useDrugs';

const deleteMutation = useDeleteDrug();
deleteMutation.mutate(drugId);
```

---

### Orders & Cart Hooks (`useOrders.js`)

#### Fetch Orders
```jsx
import { useOrders } from '../../hooks/api/useOrders';

const { data: orders } = useOrders();
```

#### Fetch Single Order
```jsx
import { useOrder } from '../../hooks/api/useOrders';

const { data: order } = useOrder(orderId);
```

#### Create Order
```jsx
import { useCreateOrder } from '../../hooks/api/useOrders';

const createOrderMutation = useCreateOrder();

createOrderMutation.mutate({
  items: [
    { drugId: 1, quantity: 2, price: 9.99 },
    { drugId: 2, quantity: 1, price: 15.99 }
  ],
  totalAmount: 35.97,
  shippingAddress: '123 Main St'
});
```

#### Add to Cart
```jsx
import { useAddToCart } from '../../hooks/api/useOrders';

const addToCartMutation = useAddToCart();

const handleAddToCart = (medicine) => {
  addToCartMutation.mutate({
    drugId: medicine.id,
    quantity: 1,
    price: medicine.price
  });
};
```

#### Get Cart
```jsx
import { useCart } from '../../hooks/api/useOrders';

const { data: cart, isLoading } = useCart();
```

#### Cancel Order
```jsx
import { useCancelOrder } from '../../hooks/api/useOrders';

const cancelMutation = useCancelOrder();
cancelMutation.mutate(orderId);
```

---

### Prescriptions Hooks (`usePrescriptions.js`)

#### Fetch Prescriptions
```jsx
import { usePrescriptions } from '../../hooks/api/usePrescriptions';

const { data: prescriptions } = usePrescriptions();
```

#### Fetch Single Prescription
```jsx
import { usePrescription } from '../../hooks/api/usePrescriptions';

const { data: prescription } = usePrescription(prescriptionId);
```

#### Create Prescription
```jsx
import { useCreatePrescription } from '../../hooks/api/usePrescriptions';

const createMutation = useCreatePrescription();

createMutation.mutate({
  patientName: 'John Doe',
  medications: ['Medicine A', 'Medicine B'],
  doctorName: 'Dr. Smith',
  date: new Date().toISOString()
});
```

#### Upload Prescription Image
```jsx
import { useUploadPrescription } from '../../hooks/api/usePrescriptions';

const uploadMutation = useUploadPrescription();

const handleUpload = (file) => {
  const formData = new FormData();
  formData.append('prescription', file);
  
  uploadMutation.mutate(formData);
};
```

---

### Notifications Hooks (`useNotifications.js`)

#### Fetch Notifications
```jsx
import { useNotifications } from '../../hooks/api/useNotifications';

const { data: notifications } = useNotifications();
```

#### Fetch Unread Notifications (Auto-refresh every 30s)
```jsx
import { useUnreadNotifications } from '../../hooks/api/useNotifications';

const { data: unread } = useUnreadNotifications();
// Automatically refetches every 30 seconds
```

#### Get Unread Count
```jsx
import { useUnreadCount } from '../../hooks/api/useNotifications';

const { data: count } = useUnreadCount();
```

#### Mark as Read
```jsx
import { useMarkAsRead } from '../../hooks/api/useNotifications';

const markAsReadMutation = useMarkAsRead();
markAsReadMutation.mutate(notificationId);
```

#### Mark All as Read
```jsx
import { useMarkAllAsRead } from '../../hooks/api/useNotifications';

const markAllMutation = useMarkAllAsRead();
markAllMutation.mutate();
```

---

## 🎯 Query Keys Pattern

Each hook file exports query keys for better cache management:

```jsx
import { drugsKeys } from '../../hooks/api/useDrugs';

// Invalidate all drugs queries
queryClient.invalidateQueries({ queryKey: drugsKeys.all });

// Invalidate specific drug
queryClient.invalidateQueries({ queryKey: drugsKeys.detail(drugId) });

// Invalidate drug lists
queryClient.invalidateQueries({ queryKey: drugsKeys.lists() });
```

---

## 🔄 Mutation Callbacks

All mutations support custom callbacks:

```jsx
mutation.mutate(data, {
  onSuccess: (responseData) => {
    console.log('Success!', responseData);
  },
  onError: (error) => {
    console.error('Error:', error);
  },
  onSettled: () => {
    console.log('Mutation completed (success or error)');
  }
});
```

---

## 🎨 Common Patterns

### Loading State
```jsx
const { data, isLoading, isFetching } = useDrugs();

if (isLoading) return <Spinner />;
// or
{isLoading && <Spinner />}
```

### Error Handling
```jsx
const { data, isError, error } = useDrugs();

if (isError) {
  return <div>Error: {error.message}</div>;
}
```

### Mutation with Loading Button
```jsx
const mutation = useCreateDrug();

<button 
  onClick={() => mutation.mutate(drugData)}
  disabled={mutation.isPending}
>
  {mutation.isPending ? 'Creating...' : 'Create Drug'}
</button>
```

### Optimistic Updates
```jsx
const updateMutation = useMutation({
  mutationFn: updateDrug,
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: drugsKeys.all });
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(drugsKeys.all);
    
    // Optimistically update
    queryClient.setQueryData(drugsKeys.all, (old) => [...old, newData]);
    
    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(drugsKeys.all, context.previous);
  },
});
```

---

## 📝 Notes

1. **Global Error Handling**: Errors are automatically handled globally via toast notifications (configured in `App.jsx`)
2. **Auto-retry**: Failed queries retry once by default
3. **Cache Time**: Data is cached for 10 minutes
4. **Stale Time**: Data is fresh for 5 minutes
5. **Authentication**: All requests automatically include JWT token from auth store

---

## 🚀 Best Practices

1. **Use Query Keys**: Always use the exported query keys for cache invalidation
2. **Handle Loading States**: Always handle `isLoading` and `isPending` states
3. **Error Boundaries**: Consider wrapping components in error boundaries
4. **Disable Queries**: Use `enabled: false` to disable queries conditionally
5. **Prefetch**: Use `queryClient.prefetchQuery()` for data you know you'll need

---

## 🔗 Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)

