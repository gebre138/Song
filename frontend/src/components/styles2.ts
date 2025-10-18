import styled from "@emotion/styled";
import { motion } from "framer-motion";

// ==========================
// Container and Layout
// ==========================
export const Container = styled.div`
  max-width: 900px;
  margin: 40px auto;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  height: 90vh; /* Full viewport height for scrollable list */
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

export const Title = styled.h1`
  font-size: 28px;
  font-weight: bold;
  color: #1f1f1f;
`;

export const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 6px;
  border: none;
  background-color: #52c41a;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #389e0d;
    transform: scale(1.05);
  }
`;

// ==========================
// Song List
// ==========================
export const ListContainer = styled.div`
  flex: 1; /* take remaining space */
  overflow-y: auto; /* vertical scroll */
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 4px; /* prevent content hiding behind scrollbar */
`;

export const SongCard = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  border-radius: 10px;
  background-color: #ffffff;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 12px rgba(0, 0, 0, 0.15);
  }
`;

export const SongInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 15px;
`;

export const SongFieldWrapper = styled.div`
  display: flex;
  gap: 6px;
`;

export const SongLabel = styled.span`
  font-weight: bold;
  color: #1890ff;
`;

export const SongField = styled.span`
  color: #333;
`;

// ==========================
// Buttons
// ==========================
export const Button = styled.button`
  padding: 8px 14px;
  min-width: 80px; /* consistent width */
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  margin-left: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease-in-out;

  &.edit {
    background-color: #1890ff;
    color: white;
  }

  &.delete {
    background-color: #ff4d4f;
    color: white;
  }

  &.edit:hover {
    background-color: #1070d0;
  }

  &.delete:hover {
    background-color: #d43838;
  }
`;

export const ToggleButton = styled.button`
  padding: 10px 20px;
  background-color: #4f46e5; /* Indigo */
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  align-self: center; /* center under stats */
  margin-top: 16px;

  &:hover {
    background-color: #4338ca; /* Darker shade */
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
    background-color: #3730a3;
  }
`;

// ==========================
// Statistics Section - BORDERLESS AND COMPACT
// ==========================

// Miniaturized Icon Circle
export const StatIconCircle = styled.div`
  background-color: #e6fffb; /* Light teal background */
  color: #008779; /* Darker teal/green icon color */
  border-radius: 50%;
  width: 40px; 
  height: 40px; 
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 8px; 
  font-size: 20px; 
`;

export const StatsContainer = styled.div`
  display: grid;
  /* Reduced minmax to allow smaller cards (e.g., 120px) */
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 24px;
  max-width: 100%;
  overflow-y: auto;
  max-height: 400px;
  padding-right: 4px;
`;

export const StatCard = styled.div`
  background-color: #ffffff;
  border-radius: 6px;
  padding: 10px 4px; 
  text-align: center;
  /* --- KEY CHANGE: REMOVE BORDER AND USE SUBTLE SHADOW --- */
  border: none;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1); /* Subtle shadow for borderless lift */
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: default;

  &:hover {
    transform: translateY(-2px); /* Added translateY for interactivity */
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
`;

export const StatNumber = styled.div`
  font-size: 1.4rem; 
  font-weight: 700;
  color: #1f1f1f;
  margin-bottom: 2px; 
`;

export const StatLabel = styled.div`
  font-size: 0.75rem; 
  color: #666;
  margin-top: 0;
  line-height: 1.1; 
`;

// ==========================
// Modal (Delete Confirmation)
// ==========================
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background-color: #fff;
  padding: 24px 32px;
  border-radius: 10px;
  text-align: center;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
`;

export const ModalButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
`;

export const ModalButtonConfirm = styled.button`
  padding: 8px 16px;
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background-color: #d43838;
  }
`;

export const ModalButtonCancel = styled.button`
  padding: 8px 16px;
  background-color: #ccc;
  color: #333;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background-color: #999;
  }
`;