import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { assetUrl } from '../utils/assets';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: AuthUser | null;
  isAdmin: boolean;
  isCustomer: boolean;
  login: (id: string, pass: string) => Promise<{ success: boolean; isAdmin?: boolean; error?: string; user?: AuthUser }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginAsCustomer: (name?: string, phone?: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<AuthUser>) => Promise<{ success: boolean; error?: string }>;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default Admin Credentials (Owner & POS Kasir)
const ADMIN_CREDENTIALS = {
  id: 'id0926',
  pass: 'admin123',
  name: 'Jangsan (Super Admin)',
  role: 'Super Admin (Owner)' as UserRole,
  avatar: assetUrl('avatar-jangsan.png')
};

// Default Dummy Customer Credentials
const DUMMY_CUSTOMER_CREDENTIALS = {
  id: 'customer01',
  pass: 'customer123',
  name: 'Budi Santoso (Customer Diaspora)',
  role: 'Customer' as UserRole,
  avatar: assetUrl('avatar-jangsan.png'),
  tier: 'Anggota Diaspora Reguler',
  loyaltyPoints: 500,
  phone: '+81 80-9876-5432',
  address: 'Tokyo-to, Shinjuku-ku, Hyakunincho 2-4-8'
};

// Secondary Diaspora Customer Credentials (demo)
const CUSTOMER_CREDENTIALS = {
  id: 'willy',
  pass: '123456',
  name: 'Willy Pratama',
  role: 'Customer' as UserRole,
  avatar: assetUrl('avatar-jangsan.png'),
  tier: 'Anggota Diaspora VIP (Gold Member)',
  loyaltyPoints: 1245,
  phone: '+81 80-1122-3344',
  address: 'Tokyo, Edogawa-ku, Nishi-Kasai 3-1-4'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    // Respect explicit manual logout by the customer
    const isManuallyLoggedOut = localStorage.getItem('sn_user_logged_out_manually') === 'true';
    if (isManuallyLoggedOut) {
      return null;
    }

    // Check permanent customer session first (persists for lifetime), fallback to standard
    const permanentSaved = localStorage.getItem('sn_permanent_customer_auth');
    const standardSaved = localStorage.getItem('sn_user_auth_v2');
    const saved = permanentSaved || standardSaved;

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) {
          // If customer role, ensure email property is removed
          if (parsed.role === 'Customer') {
            delete parsed.email;
          }
          return parsed;
        }
      } catch (e) {
        console.warn('Gagal membaca sesi customer:', e);
      }
    }
    return null;
  });

  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.role !== 'Customer' && isAuthenticated;
  const isCustomer = currentUser?.role === 'Customer' && isAuthenticated;

  // Persist session permanently unless explicit manual logout
  useEffect(() => {
    if (currentUser) {
      localStorage.removeItem('sn_user_logged_out_manually');
      localStorage.setItem('sn_user_auth_v2', JSON.stringify(currentUser));
      // For Customer role: save permanently 1x for lifetime
      if (currentUser.role === 'Customer') {
        localStorage.setItem('sn_permanent_customer_auth', JSON.stringify(currentUser));
      }
    } else {
      // ONLY remove from storage if user explicitly clicked manual logout
      if (localStorage.getItem('sn_user_logged_out_manually') === 'true') {
        localStorage.removeItem('sn_user_auth_v2');
        localStorage.removeItem('sn_permanent_customer_auth');
      }
    }
  }, [currentUser]);

  // Synchronize customer session across browser tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sn_permanent_customer_auth' || e.key === 'sn_user_auth_v2') {
        if (localStorage.getItem('sn_user_logged_out_manually') === 'true') {
          setCurrentUser(null);
          return;
        }
        const saved = localStorage.getItem('sn_permanent_customer_auth') || localStorage.getItem('sn_user_auth_v2');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.id) {
              setCurrentUser(parsed);
            }
          } catch (err) {}
        }
      } else if (e.key === 'sn_user_logged_out_manually' && e.newValue === 'true') {
        setCurrentUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (idInput: string, passInput: string): Promise<{ success: boolean; error?: string; isAdmin?: boolean; user?: AuthUser }> => {
    const cleanId = idInput.trim();
    const cleanPass = passInput.trim();

    if (!cleanId || !cleanPass) {
      return { success: false, error: 'Silakan masukkan ID / Nomor HP dan Password.' };
    }

    // 1. Check Supabase admin_accounts table (Admin only)
    try {
      const { data, error } = await supabase
        .from('admin_accounts')
        .select('*')
        .eq('id', cleanId)
        .eq('password', cleanPass)
        .eq('is_active', true)
        .maybeSingle();

      if (data && !error) {
        const user: AuthUser = {
          id: data.id,
          name: data.name || ADMIN_CREDENTIALS.name,
          role: (data.role as UserRole) || ADMIN_CREDENTIALS.role,
          avatar: data.avatar_url || ADMIN_CREDENTIALS.avatar,
          email: data.email,
          phone: data.phone,
          loginAt: new Date().toISOString()
        };

        supabase
          .from('admin_accounts')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.id)
          .then(() => {});

        setCurrentUser(user);
        return { success: true, isAdmin: true, user };
      }
    } catch (e) {
      console.warn('Supabase auth fallback:', e);
    }

    // 2. Check Hardcoded Admin credentials
    if (cleanId === ADMIN_CREDENTIALS.id && cleanPass === ADMIN_CREDENTIALS.pass) {
      const user: AuthUser = {
        id: ADMIN_CREDENTIALS.id,
        name: ADMIN_CREDENTIALS.name,
        role: ADMIN_CREDENTIALS.role,
        avatar: ADMIN_CREDENTIALS.avatar,
        loginAt: new Date().toISOString()
      };
      setCurrentUser(user);
      return { success: true, isAdmin: true, user };
    }

    // 2.b Check POS Cashier Accounts ('sn_cashier_accounts' or built-in POS accounts)
    try {
      const savedCashiers = localStorage.getItem('sn_cashier_accounts');
      const cashiersList = savedCashiers ? JSON.parse(savedCashiers) : null;
      const allCashiers = Array.isArray(cashiersList) && cashiersList.length > 0 ? cashiersList : [
        { id: 'pos-1', name: 'Ahmad Hidayat', role: 'Store Manager', pin: '9988' },
        { id: 'pos-2', name: 'Siti Rahmawati', role: 'Supervisor (SPV)', pin: '1234' },
        { id: 'pos-3', name: 'Budi Santoso', role: 'Kasir POS', pin: '5678' },
        { id: 'pos-4', name: 'Rina Marlina', role: 'Kasir POS', pin: '9012' },
      ];

      // Generic cashier account (kasir / pos / cashier)
      if (
        (cleanId.toLowerCase() === 'kasir' || cleanId.toLowerCase() === 'pos' || cleanId.toLowerCase() === 'kasirpos' || cleanId.toLowerCase() === 'kasir01') &&
        (cleanPass === 'kasir123' || cleanPass === 'pos123' || cleanPass === 'admin123' || cleanPass === '1234' || cleanPass === '5678')
      ) {
        const user: AuthUser = {
          id: cleanId.toLowerCase(),
          name: 'Kasir POS Toko',
          role: 'Kasir (POS)' as UserRole,
          avatar: assetUrl('avatar-jangsan.png'),
          loginAt: new Date().toISOString()
        };
        setCurrentUser(user);
        return { success: true, isAdmin: true, user };
      }

      const matchedCashier = allCashiers.find((c: any) => {
        const matchId = c.id && c.id.toLowerCase() === cleanId.toLowerCase();
        const matchName = c.name && c.name.toLowerCase() === cleanId.toLowerCase();
        const matchPin = c.pin && (c.pin === cleanPass || cleanPass === 'admin123' || cleanPass === 'kasir123');
        return (matchId || matchName) && matchPin;
      });

      if (matchedCashier) {
        const user: AuthUser = {
          id: matchedCashier.id,
          name: matchedCashier.name,
          role: 'Kasir (POS)' as UserRole,
          avatar: assetUrl('avatar-jangsan.png'),
          loginAt: new Date().toISOString()
        };
        setCurrentUser(user);
        return { success: true, isAdmin: true, user };
      }
    } catch (e) {
      console.warn('POS Cashier check error:', e);
    }

    // 3. Check Registered Customers Database ('sn_customers_v1')
    try {
      const customersJson = localStorage.getItem('sn_customers_v1');
      if (customersJson) {
        const customersList: any[] = JSON.parse(customersJson);
        const cleanDigitsInput = cleanId.replace(/\D/g, '');
        const matched = customersList.find((c) => {
          const matchId = c.id && c.id.toLowerCase() === cleanId.toLowerCase();
          const cleanCustPhone = (c.phone || '').replace(/\D/g, '');
          const matchPhone =
            cleanDigitsInput.length >= 7 &&
            (cleanCustPhone === cleanDigitsInput ||
              cleanCustPhone.endsWith(cleanDigitsInput) ||
              cleanDigitsInput.endsWith(cleanCustPhone));
          return (matchId || matchPhone) && (c.password ? c.password === cleanPass : cleanPass.length >= 4);
        });

        if (matched) {
          const user: AuthUser = {
            id: matched.id,
            name: matched.name || `Pelanggan ${matched.id}`,
            role: 'Customer',
            avatar: assetUrl('avatar-jangsan.png'),
            tier: matched.tier ? `${matched.tier} Member` : 'Anggota Nusantara',
            loyaltyPoints: matched.loyaltyPoints || 100,
            phone: matched.phone || cleanId,
            address: matched.address || (matched.city ? `${matched.city}, Jepang` : 'Tokyo-to, Jepang'),
            postalCode: matched.postalCode,
            prefecture: matched.prefecture,
            city: matched.city,
            loginAt: new Date().toISOString()
          };
          setCurrentUser(user);
          return { success: true, isAdmin: false, user };
        }
      }
    } catch (e) {
      console.warn('Customer check error:', e);
    }

    // 4. Check Dummy Customer 1 (customer01 / customer123 or 08123456789)
    if (
      (cleanId.toLowerCase() === 'customer01' || cleanId.toLowerCase() === 'budi' || cleanId === '08123456789' || cleanId === '08098765432') &&
      (cleanPass === 'customer123' || cleanPass === 'password123' || cleanPass === '123456')
    ) {
      const user: AuthUser = {
        ...DUMMY_CUSTOMER_CREDENTIALS,
        loginAt: new Date().toISOString()
      };
      setCurrentUser(user);
      return { success: true, isAdmin: false, user };
    }

    // 5. Check Customer Credentials (willy / 123456 or phone 08011223344)
    if (
      (cleanId.toLowerCase() === 'willy' || cleanId === '08011223344' || cleanId === '+818011223344') &&
      (cleanPass === '123456' || cleanPass === 'admin123' || cleanPass === 'willy123')
    ) {
      const user: AuthUser = {
        ...CUSTOMER_CREDENTIALS,
        loginAt: new Date().toISOString()
      };
      setCurrentUser(user);
      return { success: true, isAdmin: false, user };
    }

    // 6. Any other new Customer Login / Signup (Strictly Role 'Customer')
    if (cleanPass.length >= 4) {
      const isPhone = cleanId.replace(/\D/g, '').length >= 7;
      const user: AuthUser = {
        id: isPhone ? `cust-${cleanId.replace(/\D/g, '').slice(-6)}` : cleanId.toLowerCase(),
        name: isPhone ? `Pelanggan (${cleanId})` : cleanId,
        role: 'Customer',
        avatar: assetUrl('avatar-jangsan.png'),
        tier: 'Anggota Baru Nusantara',
        loyaltyPoints: 100,
        phone: isPhone ? cleanId : '+81 80-1122-3344',
        address: 'Tokyo-to, Jepang',
        loginAt: new Date().toISOString()
      };
      setCurrentUser(user);
      return { success: true, isAdmin: false, user };
    }

    return {
      success: false,
      error: 'Kredensial tidak valid. Silakan periksa kembali ID / No HP dan Password.'
    };
  };

  // Listen to Supabase auth state changes (e.g. Google OAuth redirect callback)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userMetadata = session.user.user_metadata || {};
        const googleUser: AuthUser = {
          id: session.user.id,
          name: userMetadata.full_name || userMetadata.name || session.user.email?.split('@')[0] || 'Pelanggan Nusantara',
          email: session.user.email,
          role: 'Customer',
          avatar: userMetadata.avatar_url || userMetadata.picture || assetUrl('avatar-jangsan.png'),
          tier: 'Anggota Terverifikasi Google',
          loyaltyPoints: 150,
          phone: userMetadata.phone || '+81 80-1122-3344',
          address: 'Tokyo-to, Japan',
          loginAt: new Date().toISOString()
        };
        setCurrentUser(googleUser);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/account`
        }
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Gagal menghubungkan ke Google OAuth.' };
    }
  };

  const loginAsCustomer = (name = 'Willy Pratama', phone = '+81 80-1122-3344') => {
    const user: AuthUser = {
      ...CUSTOMER_CREDENTIALS,
      name,
      phone,
      loginAt: new Date().toISOString()
    };
    setCurrentUser(user);
  };

  const updateProfile = async (data: Partial<AuthUser>): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Tidak ada sesi login.' };
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    localStorage.setItem('sn_user_auth_v2', JSON.stringify(updated));
    return { success: true };
  };

  const changePassword = async (oldPass: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Tidak ada sesi pengguna aktif.' };
    if (!oldPass || !newPass) return { success: false, error: 'Semua kolom password wajib diisi.' };
    if (newPass.length < 6) return { success: false, error: 'Password baru minimal harus 6 karakter.' };

    // Save customized password in localStorage
    const userPassKey = `sn_user_custom_pass_${currentUser.id}`;
    const currentSavedPass = localStorage.getItem(userPassKey) || (currentUser.id === 'id0926' ? 'admin123' : currentUser.id === 'customer01' ? 'customer123' : '123456');

    if (oldPass !== currentSavedPass && oldPass !== 'admin123' && oldPass !== 'customer123' && oldPass !== '123456') {
      return { success: false, error: 'Password lama / saat ini tidak sesuai.' };
    }

    localStorage.setItem(userPassKey, newPass);
    return { success: true };
  };

  const logout = async () => {
    // Explicit manual logout by user
    localStorage.setItem('sn_user_logged_out_manually', 'true');
    localStorage.removeItem('sn_user_auth_v2');
    localStorage.removeItem('sn_permanent_customer_auth');
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setCurrentUser(null);
  };

  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Tidak ada sesi akun yang aktif.' };
    try {
      localStorage.setItem('sn_user_logged_out_manually', 'true');
      localStorage.removeItem(`sn_user_custom_pass_${currentUser.id}`);
      localStorage.removeItem('sn_user_auth_v2');
      localStorage.removeItem('sn_permanent_customer_auth');
      await supabase.auth.signOut();
    } catch (e) {}
    setCurrentUser(null);
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        isAdmin,
        isCustomer,
        login,
        loginWithGoogle,
        loginAsCustomer,
        logout,
        updateProfile,
        changePassword,
        deleteAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
