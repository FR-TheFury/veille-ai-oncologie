
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

export const use2FA = () => {
  const [isLoading, setIsLoading] = useState(false);

  const generateTOTPSecret = () => {
    return authenticator.generateSecret();
  };

  const generateQRCode = async (email: string, secret: string) => {
    const service = 'OncIA Watch';
    const otpauthUrl = authenticator.keyuri(email, service, secret);
    
    try {
      const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl);
      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    }
  };

  const enable2FA = async (secret: string, token: string) => {
    setIsLoading(true);
    
    // Vérifier le token
    const isValid = authenticator.verify({ token, secret });
    
    if (!isValid) {
      toast.error('Code de vérification invalide');
      setIsLoading(false);
      return { error: 'Invalid token' };
    }

    // Générer des codes de sauvegarde
    const backupCodes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );

    // Sauvegarder dans la base de données
    const { error } = await supabase
      .from('profiles')
      .update({
        totp_secret: secret,
        totp_enabled: true,
        backup_codes: backupCodes
      })
      .eq('id', (await supabase.auth.getUser()).data.user?.id);

    if (error) {
      toast.error(`Erreur: ${error.message}`);
      setIsLoading(false);
      return { error };
    }

    toast.success('Authentification à deux facteurs activée !');
    setIsLoading(false);
    return { error: null, backupCodes };
  };

  const disable2FA = async () => {
    setIsLoading(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        totp_secret: null,
        totp_enabled: false,
        backup_codes: null
      })
      .eq('id', (await supabase.auth.getUser()).data.user?.id);

    if (error) {
      toast.error(`Erreur: ${error.message}`);
    } else {
      toast.success('Authentification à deux facteurs désactivée');
    }

    setIsLoading(false);
    return { error };
  };

  const verify2FA = async (token: string, secret: string) => {
    return authenticator.verify({ token, secret });
  };

  return {
    generateTOTPSecret,
    generateQRCode,
    enable2FA,
    disable2FA,
    verify2FA,
    isLoading
  };
};
