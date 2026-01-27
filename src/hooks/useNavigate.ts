export const useNavigate = () => {
  return (path: string) => {
    if (path === '/') {
      // Clear the hash to go back to the main page
      window.location.hash = '';
      window.location.reload();
    }
  };
};
