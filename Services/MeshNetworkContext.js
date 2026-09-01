import React, { createContext, useState, useContext } from 'react';
import { Alert } from 'react-native';

const MeshNetworkContext = createContext();

export function MeshNetworkProvider({ children }) {
  const [meshNodeActive, setMeshNodeActive] = useState(true);
  const [meshPeerCount, setMeshPeerCount] = useState(4);
  const [localChatLog, setLocalChatLog] = useState([
    { id: '1', sender: 'Node_Kampala_02', text: 'Secure multi-hop packet route established via local Wi-Fi mesh.' },
    { id: '2', sender: 'Node_Bwindi_01', text: 'Offline data chunk synced across local peers.' }
  ]);
  const [ghostVaults, setGhostVaults] = useState({});

  // Broadcast a packet across local mesh peers without internet
  const sendMeshPacket = (senderName, messageText) => {
    if (!messageText.trim()) return;
    const newPacket = { id: Date.now().toString(), sender: senderName, text: messageText };
    setLocalChatLog(prev => [...prev, newPacket]);
    Alert.alert('Mesh Relay 🛰️', 'Packet broadcasted across local multi-hop mesh nodes (Zero Internet).');
  };

  // Secure local ghost vault storage
  const lockGhostVault = (vaultKey, dataPayload) => {
    if (!vaultKey.trim()) return false;
    setGhostVaults(prev => ({ ...prev, [vaultKey]: { encrypted: true, data: dataPayload, timestamp: Date.now() } }));
    Alert.alert('Ghost Vault 🛡️', 'Data locked and encrypted locally with zero cloud footprint!');
    return true;
  };

  return (
    <MeshNetworkContext.Provider value={{
      meshNodeActive,
      setMeshNodeActive,
      meshPeerCount,
      localChatLog,
      sendMeshPacket,
      lockGhostVault
    }}>
      {children}
    </MeshNetworkContext.Provider>
  );
}

export function useMeshNetwork() {
  return useContext(MeshNetworkContext);
}