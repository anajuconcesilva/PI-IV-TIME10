// Aluna: Ana Júlia Conceição da Silva | RA: 25002592

import java.io.*;

// Classe utilitaria para ler dados do teclado
public class Teclado
{
    private static BufferedReader teclado =
            new BufferedReader (new InputStreamReader (System.in));

    // Le uma linha de texto do teclado
    public static String getUmString () throws Exception
    {
        String ret = null;

        try
        {
            ret = Teclado.teclado.readLine ();
        }
        catch (IOException erro)
        {
            throw new Exception ("Erro na leitura do teclado");
        }

        return ret;
    }

    // Le um booleano do teclado
    public static boolean getUmBoolean () throws Exception
    {
        boolean ret = false;

        try
        {
            String str = Teclado.teclado.readLine ();
            if (str == null || (!str.equalsIgnoreCase ("true") && !str.equalsIgnoreCase ("false")))
                throw new Exception ();

            ret = Boolean.parseBoolean (str);
        }
        catch (Exception erro)
        {
            throw new Exception ("Booleano invalido");
        }

        return ret;
    }

    // Le um numero inteiro do teclado
    public static int getUmInt () throws Exception
    {
        int ret = 0;

        try
        {
            ret = Integer.parseInt (Teclado.teclado.readLine ());
        }
        catch (Exception erro)
        {
            throw new Exception ("Inteiro invalido");
        }

        return ret;
    }

    // Le um short do teclado
    public static short getUmShort () throws Exception
    {
        short ret = 0;

        try
        {
            ret = Short.parseShort (Teclado.teclado.readLine ());
        }
        catch (Exception erro)
        {
            throw new Exception ("Short invalido");
        }

        return ret;
    }

    // Le um long do teclado
    public static long getUmLong () throws Exception
    {
        long ret = 0;

        try
        {
            ret = Long.parseLong (Teclado.teclado.readLine ());
        }
        catch (Exception erro)
        {
            throw new Exception ("Long invalido");
        }

        return ret;
    }

    // Le um float do teclado
    public static float getUmFloat () throws Exception
    {
        float ret = 0.0F;

        try
        {
            ret = Float.parseFloat (Teclado.teclado.readLine ());
        }
        catch (Exception erro)
        {
            throw new Exception ("Float invalido");
        }

        return ret;
    }

    // Le um double do teclado
    public static double getUmDouble () throws Exception
    {
        double ret = 0.0;

        try
        {
            ret = Double.parseDouble (Teclado.teclado.readLine ());
        }
        catch (Exception erro)
        {
            throw new Exception ("Double invalido");
        }

        return ret;
    }

    // Le um caractere do teclado
    public static char getUmChar () throws Exception
    {
        char ret = ' ';

        try
        {
            String str = Teclado.teclado.readLine ();

            if (str == null || str.isEmpty ())
                throw new Exception ();

            ret = str.charAt (0);
        }
        catch (Exception erro)
        {
            throw new Exception ("Caractere invalido");
        }

        return ret;
    }

    // Le um byte do teclado
    public static byte getUmByte () throws Exception
    {
        byte ret = 0;

        try
        {
            ret = Byte.parseByte (Teclado.teclado.readLine ());
        }
        catch (Exception erro)
        {
            throw new Exception ("Byte invalido");
        }

        return ret;
    }
}