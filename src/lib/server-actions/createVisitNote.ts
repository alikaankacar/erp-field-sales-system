'use server';

// ============================================================================
// ZİYARET NOTU OLUŞTURMA - SERVER ACTION
// ============================================================================
// Saha temsilcisinin müşteri ziyaretini kaydetmek için

import { prisma } from '@/lib/db';
import { CreateVisitNoteSchema } from '@/types/requests';
import { VisitNoteResponse } from '@/types';
import { ValidationError, NotFoundError, InternalServerError } from '@/types/errors';
import { validateUserRole } from '@/lib/utils/auth';
import { auditLog } from '@/lib/utils/audit';

export async function createVisitNote(
  data: unknown,
  userId: string
): Promise<VisitNoteResponse> {
  try {
    // ============================================================================
    // ADIM 1: YETKİ KONTROL
    // ============================================================================
    if (!userId) {
      throw new ValidationError('Kullanıcı kimliği gereklidir');
    }

    // Kullanıcı rolü kontrolü (Saha Temsilcisi ve üstü)
    await validateUserRole(userId, ['FIELD_REP', 'SUPER_ADMIN']);

    // ============================================================================
    // ADIM 2: VERİ VALİDASYONU
    // ============================================================================
    const validatedData = CreateVisitNoteSchema.parse(data);

    // ============================================================================
    // ADIM 3: REFERANS KONTROL
    // ============================================================================
    const customerExists = await prisma.customer.findUnique({
      where: { id: validatedData.customerId },
    });

    if (!customerExists) {
      throw new NotFoundError(`Müşteri bulunamadı: ${validatedData.customerId}`, 'Customer');
    }

    const fieldRepExists = await prisma.user.findUnique({
      where: { id: validatedData.fieldRepId },
    });

    if (!fieldRepExists) {
      throw new NotFoundError(`Saha temsilcisi bulunamadı: ${validatedData.fieldRepId}`, 'User');
    }

    // ============================================================================
    // ADIM 4: ZİYARET NOTUNU OLUŞTUR
    // ============================================================================
    const visitNote = await prisma.visitNote.create({
      data: {
        customerId: validatedData.customerId,
        fieldRepId: validatedData.fieldRepId,
        visitDate: validatedData.visitDate,
        durationMinutes: validatedData.durationMinutes,
        notes: validatedData.notes,
        voiceNoteTranscript: validatedData.voiceNoteTranscript,
        stockObservation: validatedData.stockObservation,
        competitorInfo: validatedData.competitorInfo,
        displayMerchandising: validatedData.displayMerchandising,
        orderPotential: validatedData.orderPotential,
        followUpRequired: validatedData.followUpRequired,
        followUpDate: validatedData.followUpDate,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
      },
    });

    // ============================================================================
    // ADIM 5: MÜŞTERİ İSTATİSTİKLERİNİ GÜNCELLE
    // ============================================================================
    await prisma.customer.update({
      where: { id: validatedData.customerId },
      data: {
        lastVisitDate: new Date(),
        totalVisits: {
          increment: 1,
        },
      },
    });

    // ============================================================================
    // ADIM 6: AUDİT LOGU KAYDET
    // ============================================================================
    await auditLog({
      userId,
      action: 'CREATE',
      entity: 'VisitNote',
      entityId: visitNote.id,
      changes: JSON.stringify({
        before: null,
        after: visitNote,
      }),
    });

    return {
      success: true,
      visitNoteId: visitNote.id,
    };
  } catch (error) {
    // Hata yönetimi
    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof NotFoundError) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error('[createVisitNote] Beklenmeyen hata:', error);
    return {
      success: false,
      error: 'Ziyaret notu oluşturulurken bir hata oluştu',
    };
  }
}

// ============================================================================
// MÜŞTERİ ZİYARET GEÇMİŞİNİ GETIR
// ============================================================================

export async function getCustomerVisitHistory(customerId: string, limit: number = 10) {
  try {
    const visits = await prisma.visitNote.findMany({
      where: { customerId },
      orderBy: { visitDate: 'desc' },
      take: limit,
      include: {
        fieldRep: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      data: visits,
    };
  } catch (error) {
    console.error('[getCustomerVisitHistory] Hata:', error);
    return {
      success: false,
      error: 'Ziyaret geçmişi alınamadı',
    };
  }
}
