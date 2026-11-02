// Aluna: Eduarda Prado Deiró | RA: 25004440

import java.io.*;

/**
 * Lê dados digitados no teclado.
 *
 * @author Eduarda Prado Deiró
 * @since 2026
 */
public class Teclado
{
    private static BufferedReader teclado =
                   new BufferedReader (
                   new InputStreamReader (
                   System.in));

    /**
     * Lê uma linha de texto.
     *
     * @return linha digitada, ou null se a entrada acabar
     */
    public static String getUmString ()
    {
        String ret = null;

        try
        {
            ret = teclado.readLine ();
        }
        catch (IOException erro)
        {} // sei que nao vai dar erro

        return ret;
    }

    /**
     * Lê um byte.
     *
     * @return           número digitado
     * @throws Exception se o que foi digitado não for um byte
     */
    public static byte getUmByte () throws Exception
    {
        byte ret = (byte)0;

        try
        {
            ret = Byte.parseByte (teclado.readLine ());
        }
        catch (IOException erro)
        {} // sei que nao vai dar erro
        catch (NumberFormatException erro)
        {
            throw new Exception ("Byte invalido!");
        }

        return ret;
    }

    /**
     * Lê um short.
     *
     * @return           número digitado
     * @throws Exception se o que foi digitado não for um short
     */
    public static short getUmShort () throws Exception
    {
        short ret = (short)0;

        try
        {
            ret = Short.parseShort (teclado.readLine ());
        }
        catch (IOException erro)
        {} // sei que nao vai dar erro
        catch (NumberFormatException erro)
        {
            throw new Exception ("Short invalido!");
        }

        return ret;
    }

    /**
     * Lê um int.
     *
     * @return           número digitado
     * @throws Exception se o que foi digitado não for um int
     */
    public static int getUmInt () throws Exception
    {
        int ret = 0;

        try
        {
            ret = Integer.parseInt (teclado.readLine ());
        }
        catch (IOException erro)
        {} // sei que nao vai dar erro
        catch (NumberFormatException erro)
        {
            throw new Exception ("Int invalido!");
        }

        return ret;
    }

    /**
     * Lê um long.
     *
     * @return           número digitado
     * @throws Exception se o que foi digitado não for um long
     */
    public static long getUmLong () throws Exception
    {
        long ret = 0L;

        try
        {
            ret = Long.parseLong (teclado.readLine ());
        }
        catch (IOException erro)
        {} // sei que nao vai dar erro
        catch (NumberFormatException erro)
        {
            throw new Exception ("Long invalido!");
        }

        return ret;
    }

    /**
     * Lê um float.
     *
     * @return           número digitado
     * @throws Exception se o que foi digitado não for um float
     */
    public static float getUmFloat () throws Exception
    {
        float ret = 0.0F;

        try
        {
            ret = Float.parseFloat (teclado.readLine ());
        }
        catch (IOException erro)
        {} // sei que nao vai dar erro
        catch (NumberFormatException erro)
        {
            throw new Exception ("Float invalido!");
        }

        return ret;
    }

    /**
     * Lê um double.
     *
     * @return           número digitado
     * @throws Exception se o que foi digitado não for um double
     */
    public static double getUmDouble () throws Exception
    {
        double ret = 0.0;

        try
        {
            ret = Double.parseDouble (teclado.readLine ());
        }
        catch (IOException erro)
        {} // sei que nao vai dar erro
        catch (NumberFormatException erro)
        {
            throw new Exception ("Double invalido!");
        }

        return ret;
    }

    /**
     * Lê um caractere.
     *
     * @return           caractere digitado
     * @throws Exception se não for digitado só um caractere
     */
    public static char getUmChar () throws Exception
    {
        char ret = ' ';

        try
        {
            String str = teclado.readLine ();

            if (str == null)
                throw new Exception ("Char invalido!");

            if (str.length () != 1)
                throw new Exception ("Char invalido!");

            ret = str.charAt (0);
        }
        catch (IOException erro)
        {} // sei que nao vai dar erro

        return ret;
    }

    /**
     * Lê true ou false.
     *
     * @return           valor digitado
     * @throws Exception se não for digitado true ou false
     */
    public static boolean getUmBoolean () throws Exception
    {
        boolean ret = false;

        try
        {
            String str = teclado.readLine ();

            if (str == null)
                throw new Exception ("Boolean invalido!");

            if (!str.equals ("true") && !str.equals ("false"))
                throw new Exception ("Boolean invalido!");

            ret = Boolean.parseBoolean (str);
        }
        catch (IOException erro)
        {} // sei que nao vai dar erro

        return ret;
    }
}
