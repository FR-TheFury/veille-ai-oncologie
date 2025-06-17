
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, QrCode, Key, AlertCircle, Copy, Check } from 'lucide-react';
import { use2FA } from '@/hooks/use2FA';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TwoFactorSetup = () => {
  const { profile } = useAuth();
  const { generateTOTPSecret, generateQRCode, enable2FA, disable2FA, isLoading } = use2FA();
  
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedCodes, setCopiedCodes] = useState(false);

  const isEnabled = profile?.totp_enabled || false;

  const startSetup = async () => {
    const newSecret = generateTOTPSecret();
    setSecret(newSecret);
    
    if (profile?.email) {
      const qr = await generateQRCode(profile.email, newSecret);
      if (qr) {
        setQrCode(qr);
        setShowSetup(true);
      }
    }
  };

  const handleEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) return;

    const result = await enable2FA(secret, verificationCode);
    if (!result.error && result.backupCodes) {
      setBackupCodes(result.backupCodes);
      setShowSetup(false);
      setVerificationCode('');
    }
  };

  const handleDisable = async () => {
    await disable2FA();
    setShowSetup(false);
    setSecret('');
    setQrCode('');
    setBackupCodes([]);
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <CardTitle>Authentification à deux facteurs</CardTitle>
            </div>
            <Badge variant={isEnabled ? "default" : "secondary"}>
              {isEnabled ? "Activée" : "Désactivée"}
            </Badge>
          </div>
          <CardDescription>
            Renforcez la sécurité de votre compte avec l'authentification à deux facteurs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEnabled && !showSetup && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                L'authentification à deux facteurs ajoute une couche de sécurité supplémentaire à votre compte.
              </p>
              <Button onClick={startSetup} disabled={isLoading}>
                <Shield className="w-4 h-4 mr-2" />
                Activer la 2FA
              </Button>
            </div>
          )}

          {isEnabled && (
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  L'authentification à deux facteurs est active sur votre compte.
                </AlertDescription>
              </Alert>
              <Button variant="destructive" onClick={handleDisable} disabled={isLoading}>
                Désactiver la 2FA
              </Button>
            </div>
          )}

          {showSetup && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <QrCode className="w-8 h-8 mx-auto text-blue-600" />
                <div>
                  <h3 className="font-semibold">Étape 1: Scannez le QR Code</h3>
                  <p className="text-sm text-muted-foreground">
                    Utilisez Google Authenticator ou une autre app TOTP
                  </p>
                </div>
                {qrCode && (
                  <div className="flex justify-center">
                    <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification-code">Étape 2: Entrez le code de vérification</Label>
                <Input
                  id="verification-code"
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={handleEnable}
                  disabled={isLoading || verificationCode.length !== 6}
                  className="flex-1"
                >
                  Confirmer l'activation
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSetup(false)}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}

          {backupCodes.length > 0 && (
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Codes de sauvegarde générés !</p>
                  <p className="text-sm">
                    Conservez ces codes en lieu sûr. Ils vous permettront d'accéder à votre compte si vous perdez votre téléphone.
                  </p>
                  <div className="grid grid-cols-2 gap-1 font-mono text-xs bg-gray-50 p-2 rounded">
                    {backupCodes.map((code, index) => (
                      <div key={index}>{code}</div>
                    ))}
                  </div>
                  <Button size="sm" onClick={copyBackupCodes} className="w-full">
                    {copiedCodes ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copié !
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copier les codes
                      </>
                    )}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TwoFactorSetup;
