import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

export default function AdminStaffHierarchyModule({
  adminRole,
  newStaffEmail,
  setNewStaffEmail,
  newStaffHandle,
  setNewStaffHandle,
  selectedRoleToAssign,
  setSelectedRoleToAssign,
  handleAssignStaffRole,
  handleExportCsvAudit,
  assignedStaffList,
  auditLogs,
  isDarkMode
}) {
  if (adminRole !== 'SuperAdmin') {
    return (
      <View style={[styles.card, isDarkMode && styles.darkCard, { padding: 24, alignItems: 'center' }]}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { textAlign: 'center' }]}>🔒 Restricted Department Access</Text>
        <Text style={{ fontSize: 11, color: '#718096', textAlign: 'center' }}>Staff role management and global audit rosters are strictly restricted to the Super-Admin.</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#2563eb', borderWidth: 1.5 }]}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>🛡️ Assign Multi-Tier Enterprise Role (Super-Admin Only)</Text>
        <Text style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>Register staff emails and assign strict departmental roles.</Text>

        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="Team Member Email (e.g., ritah@chatup.com)"
          placeholderTextColor="#a0aec0"
          value={newStaffEmail}
          onChangeText={setNewStaffEmail}
        />

        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="Team Member Handle (e.g., @ritah_chief_auditor)"
          placeholderTextColor="#a0aec0"
          value={newStaffHandle}
          onChangeText={setNewStaffHandle}
        />

        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#334155', marginBottom: 6 }}>Select Hierarchical Role:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 32, marginBottom: 10 }}>
          {[
            { key: 'ChiefFinancialAuditor', label: '🪙 Chief Auditor' },
            { key: 'FinancialSubAuditor', label: '💳 Financial Sub-Auditor' },
            { key: 'TechnicalLead', label: '⚙️ Technical Lead' },
            { key: 'DevOpsEngineer', label: '💻 DevOps Engineer' },
            { key: 'ContentModerator', label: '⚖️ Content Moderator' },
            { key: 'SupportLead', label: '🎫 Support Lead' },
          ].map(role => (
            <TouchableOpacity
              key={role.key}
              style={{ backgroundColor: selectedRoleToAssign === role.key ? '#2563eb' : '#e2e8f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 6 }}
              onPress={() => setSelectedRoleToAssign(role.key)}
            >
              <Text style={{ color: selectedRoleToAssign === role.key ? '#fff' : '#475569', fontSize: 10, fontWeight: 'bold' }}>{role.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleAssignStaffRole}>
          <Text style={styles.primaryBtnText}>Assign Role & Sync to Supabase 🚀</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#16a34a', marginBottom: 14 }]} onPress={handleExportCsvAudit}>
        <Text style={styles.primaryBtnText}>📊 Export Compliance CSV Audit Log (SOC2 / ISO)</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { marginTop: 10 }]}>📋 Active Assigned Staff Roster</Text>
      {assignedStaffList.map(staff => (
        <View key={staff.id || staff.user_email} style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>{staff.user_handle} ({staff.user_email})</Text>
          <Text style={{ fontSize: 11, color: '#2563eb', fontWeight: 'bold', marginVertical: 2 }}>Role: {staff.assigned_role}</Text>
          <Text style={{ fontSize: 9, color: '#718096' }}>Supervisor: {staff.supervisor_handle || '@super_admin_borris'}</Text>
        </View>
      ))}

      <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { marginTop: 15 }]}>👥 Staff Activity & Supabase Audit Trails</Text>
      {auditLogs.map(log => (
        <View key={log.id} style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>{log.staff}</Text>
          <Text style={{ fontSize: 11, color: '#3182ce', marginVertical: 2 }}>{log.action}</Text>
          <Text style={{ fontSize: 9, color: '#a0aec0' }}>🕒 {log.time} • IP: {log.ip}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  darkCard: { backgroundColor: '#1e293b', borderColor: '#334155' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8 },
  itemTitle: { fontSize: 12, fontWeight: '700', color: '#0f172a' },
  darkText: { color: '#f8fafc' },
  input: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 12, height: 40, backgroundColor: '#f8fafc', color: '#0f172a', fontSize: 12, marginBottom: 10 },
  darkInput: { backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' },
  primaryBtn: { backgroundColor: '#2563eb', padding: 10, borderRadius: 8, alignItems: 'center' },
  primaryBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
});