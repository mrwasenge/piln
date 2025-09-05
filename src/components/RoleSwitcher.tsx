import React from 'react';
import Select from './Select';

export type Role = 'PUBLIC' | 'ADMIN' | 'PARTNER';

interface Props {
  role: Role;
  setRole: (r: Role) => void;
}

const RoleSwitcher: React.FC<Props> = ({ role, setRole }) => (
  <Select value={role} onChange={(v) => setRole(v as Role)} placeholder="Role">
    <Select.Trigger />
    <Select.Content>
      <Select.Item value="PUBLIC">Public</Select.Item>
      <Select.Item value="ADMIN">Admin</Select.Item>
      <Select.Item value="PARTNER">Partner</Select.Item>
    </Select.Content>
  </Select>
);

export default RoleSwitcher;
