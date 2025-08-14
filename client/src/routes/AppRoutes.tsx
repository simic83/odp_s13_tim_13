import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';

// Pages
import { Home } from '../pages/Home';
import { Popular } from '../pages/Popular';
import { Profile } from '../pages/Profile';
import { NotFound } from '../pages/NotFound';
import { Auth } from '../pages/Auth';
import { Create } from '../pages/Create';
import { PinDetail } from '../pages/PinDetail';
import { CreateCollection } from '../pages/CreateCollection';
import { Collections } from '../pages/Collections';
import { CollectionView } from '../pages/CollectionView';

export const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" /> : <Auth />} />
      <Route path="/login" element={<Navigate to="/auth" />} />
      <Route path="/register" element={<Navigate to="/auth" />} />

      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="popular" element={<Popular />} />
        <Route path="collections" element={<Collections />} />
        <Route path="create" element={user ? <Create /> : <Navigate to="/auth" />} />
        <Route path="pin/:id" element={<PinDetail />} />
        <Route path="create-collection" element={user ? <CreateCollection /> : <Navigate to="/auth" />} />
        <Route path="collection/:id" element={<CollectionView />} />
        {/* Protect /profile route - redirect to auth if not logged in */}
        <Route path="profile" element={user ? <Navigate to={`/profile/${user.id}`} /> : <Navigate to="/auth" />} />
        <Route path="profile/:userId" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};