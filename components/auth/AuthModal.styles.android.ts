import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3a3a3a',
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'Architects Daughter',
  },
  errorText: {
    color: '#dc2626',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Architects Daughter',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    fontFamily: 'Architects Daughter',
    borderWidth: 1,
    borderColor: '#e3e3e3',
  },
  button: {
    backgroundColor: '#606060',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#e3e3e3',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Architects Daughter',
  },
  buttonTextDisabled: {
    color: '#747272',
  },
  switchModeButton: {
    padding: 8,
  },
  switchModeText: {
    color: '#606060',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Architects Daughter',
  },
});

export default styles;
