import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

// Inicializa o app do Firebase Admin
admin.initializeApp()

// Cloud Function para alternar o status do usuário
export const toggleUserStatus = functions.https.onCall(async (data, context) => {
  // Verifica se o usuário está autenticado
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'O usuário precisa estar autenticado.'
    )
  }

  // Verifica se os dados necessários foram fornecidos
  if (!data.uid) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'UID do usuário não fornecido.'
    )
  }

  try {
    // Verifica se o chamador é um administrador
    const callerUid = context.auth.uid
    const callerDoc = await admin.firestore().collection('usuarios').doc(callerUid).get()
    const callerData = callerDoc.data()

    if (!callerData || callerData.tipo !== 'adm') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Apenas administradores podem realizar esta ação.'
      )
    }

    // Atualiza o status do usuário no Authentication
    await admin.auth().updateUser(data.uid, {
      disabled: data.disabled
    })

    // Atualiza o status no Firestore
    await admin.firestore().collection('usuarios').doc(data.uid).update({
      ativo: !data.disabled
    })

    return { success: true, message: 'Status do usuário atualizado com sucesso.' }

  } catch (error) {
    console.error('Erro ao atualizar status do usuário:', error)
    throw new functions.https.HttpsError(
      'internal',
      'Erro ao atualizar status do usuário.',
      error
    )
  }
})
