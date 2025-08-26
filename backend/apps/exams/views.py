from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg, Count, Q, Max, Min
from django.utils import timezone
from datetime import datetime, timedelta, date

from .models import (
    Exam, ExamSchedule, Question, Answer, ExamResult, 
    StudentAnswer, Quiz, ExamSettings
)
from .serializers import (
    ExamSerializer, ExamCreateSerializer, ExamScheduleSerializer, ExamScheduleCreateSerializer,
    QuestionSerializer, QuestionCreateSerializer, AnswerSerializer, AnswerCreateSerializer,
    ExamResultSerializer, ExamResultCreateSerializer, StudentAnswerSerializer, StudentAnswerCreateSerializer,
    QuizSerializer, QuizCreateSerializer, ExamSettingsSerializer, ExamSettingsCreateSerializer,
    ExamSummarySerializer, StudentExamPerformanceSerializer, ExamAnalyticsSerializer,
    BulkQuestionCreateSerializer, ExamSubmissionSerializer
)


class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['exam_type', 'subject', 'course', 'is_active']
    search_fields = ['title', 'description', 'subject__name']
    ordering_fields = ['title', 'created_at', 'total_marks']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return ExamCreateSerializer
        return ExamSerializer

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'teacher':
            return Exam.objects.filter(created_by__user=user)
        elif user.user_type == 'student':
            return Exam.objects.filter(course__class_enrolled__students__user=user)
        return Exam.objects.all()

    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """Get all questions for an exam"""
        exam = self.get_object()
        questions = exam.questions.all()
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        """Get all results for an exam"""
        exam = self.get_object()
        results = exam.results.all()
        serializer = ExamResultSerializer(results, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        """Get exam summary with statistics"""
        exam = self.get_object()
        serializer = ExamSummarySerializer(exam)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def schedule(self, request, pk=None):
        """Schedule an exam"""
        exam = self.get_object()
        serializer = ExamScheduleCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(exam=exam)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def bulk_add_questions(self, request, pk=None):
        """Bulk add questions to an exam"""
        exam = self.get_object()
        serializer = BulkQuestionCreateSerializer(data=request.data)
        if serializer.is_valid():
            questions_data = serializer.validated_data['questions']
            created_questions = []
            
            for question_data in questions_data:
                answers_data = question_data.pop('answers')
                question = Question.objects.create(exam=exam, **question_data)
                
                for answer_data in answers_data:
                    Answer.objects.create(question=question, **answer_data)
                
                created_questions.append(question)
            
            return Response({
                'message': f'{len(created_questions)} questions created successfully',
                'questions_count': len(created_questions)
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExamScheduleViewSet(viewsets.ModelViewSet):
    queryset = ExamSchedule.objects.all()
    serializer_class = ExamScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['exam', 'start_date', 'is_online']
    search_fields = ['exam__title', 'venue', 'room_number']
    ordering_fields = ['start_date', 'start_time']
    ordering = ['start_date', 'start_time']

    def get_serializer_class(self):
        if self.action == 'create':
            return ExamScheduleCreateSerializer
        return ExamScheduleSerializer

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming exams"""
        upcoming_exams = self.queryset.filter(
            start_date__gte=timezone.now().date()
        ).order_by('start_date', 'start_time')
        serializer = self.get_serializer(upcoming_exams, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def ongoing(self, request):
        """Get currently ongoing exams"""
        now = timezone.now()
        ongoing_exams = []
        
        for schedule in self.queryset.all():
            if schedule.is_ongoing:
                ongoing_exams.append(schedule)
        
        serializer = self.get_serializer(ongoing_exams, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def completed(self, request):
        """Get completed exams"""
        completed_exams = []
        
        for schedule in self.queryset.all():
            if schedule.is_completed:
                completed_exams.append(schedule)
        
        serializer = self.get_serializer(completed_exams, many=True)
        return Response(serializer.data)


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['exam', 'question_type', 'difficulty', 'is_required']
    search_fields = ['question_text', 'explanation']
    ordering_fields = ['order', 'marks', 'created_at']
    ordering = ['exam', 'order']

    def get_serializer_class(self):
        if self.action == 'create':
            return QuestionCreateSerializer
        return QuestionSerializer

    @action(detail=True, methods=['get'])
    def answers(self, request, pk=None):
        """Get all answers for a question"""
        question = self.get_object()
        answers = question.answers.all()
        serializer = AnswerSerializer(answers, many=True)
        return Response(serializer.data)


class AnswerViewSet(viewsets.ModelViewSet):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['question', 'is_correct']
    search_fields = ['answer_text', 'explanation']
    ordering_fields = ['order', 'created_at']
    ordering = ['question', 'order']

    def get_serializer_class(self):
        if self.action == 'create':
            return AnswerCreateSerializer
        return AnswerSerializer


class ExamResultViewSet(viewsets.ModelViewSet):
    queryset = ExamResult.objects.all()
    serializer_class = ExamResultSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['exam', 'student', 'is_passed', 'is_submitted']
    search_fields = ['student__user__first_name', 'student__user__last_name', 'exam__title']
    ordering_fields = ['marks_obtained', 'percentage', 'submitted_at', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return ExamResultCreateSerializer
        return ExamResultSerializer

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'student':
            return ExamResult.objects.filter(student__user=user)
        elif user.user_type == 'teacher':
            return ExamResult.objects.filter(exam__created_by__user=user)
        return ExamResult.objects.all()

    @action(detail=True, methods=['get'])
    def student_answers(self, request, pk=None):
        """Get all student answers for a result"""
        result = self.get_object()
        student_answers = result.student_answers.all()
        serializer = StudentAnswerSerializer(student_answers, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def submit_exam(self, request, pk=None):
        """Submit an exam with answers"""
        result = self.get_object()
        serializer = ExamSubmissionSerializer(data=request.data)
        
        if serializer.is_valid():
            answers_data = serializer.validated_data['answers']
            
            for answer_data in answers_data:
                question_id = answer_data['question_id']
                question = Question.objects.get(id=question_id)
                
                student_answer, created = StudentAnswer.objects.get_or_create(
                    exam_result=result,
                    question=question,
                    defaults={
                        'text_answer': answer_data.get('text_answer', ''),
                        'numerical_answer': answer_data.get('numerical_answer'),
                        'time_taken_seconds': answer_data.get('time_taken_seconds', 0)
                    }
                )
                
                if not created:
                    student_answer.text_answer = answer_data.get('text_answer', '')
                    student_answer.numerical_answer = answer_data.get('numerical_answer')
                    student_answer.time_taken_seconds = answer_data.get('time_taken_seconds', 0)
                    student_answer.save()
                
                # Handle selected answers for objective questions
                if 'selected_answer_ids' in answer_data:
                    selected_answers = Answer.objects.filter(
                        id__in=answer_data['selected_answer_ids']
                    )
                    student_answer.selected_answers.set(selected_answers)
            
            # Mark exam as submitted
            result.is_submitted = True
            result.submitted_at = timezone.now()
            result.save()
            
            return Response({'message': 'Exam submitted successfully'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def grade_exam(self, request, pk=None):
        """Grade an exam result"""
        result = self.get_object()
        marks_obtained = request.data.get('marks_obtained')
        remarks = request.data.get('remarks', '')
        
        if marks_obtained is None:
            return Response(
                {'error': 'marks_obtained is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        result.marks_obtained = marks_obtained
        result.remarks = remarks
        result.graded_by = request.user.teacher_profile
        result.graded_at = timezone.now()
        result.save()
        
        serializer = self.get_serializer(result)
        return Response(serializer.data)


class StudentAnswerViewSet(viewsets.ModelViewSet):
    queryset = StudentAnswer.objects.all()
    serializer_class = StudentAnswerSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['exam_result', 'question', 'is_correct']
    search_fields = ['question__question_text']
    ordering_fields = ['answered_at', 'marks_obtained']
    ordering = ['-answered_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return StudentAnswerCreateSerializer
        return StudentAnswerSerializer


class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['subject', 'course', 'is_active']
    search_fields = ['title', 'description', 'subject__name']
    ordering_fields = ['title', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return QuizCreateSerializer
        return QuizSerializer

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'teacher':
            return Quiz.objects.filter(created_by__user=user)
        elif user.user_type == 'student':
            return Quiz.objects.filter(course__class_enrolled__students__user=user)
        return Quiz.objects.all()


class ExamSettingsViewSet(viewsets.ModelViewSet):
    queryset = ExamSettings.objects.all()
    serializer_class = ExamSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['class_enrolled']
    search_fields = ['class_enrolled__name']
    ordering_fields = ['created_at']
    ordering = ['class_enrolled__name']

    def get_serializer_class(self):
        if self.action == 'create':
            return ExamSettingsCreateSerializer
        return ExamSettingsSerializer


# Analytics and Dashboard Views
class ExamAnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get exam analytics dashboard"""
        user = request.user
        
        if user.user_type == 'teacher':
            exams = Exam.objects.filter(created_by__user=user)
        elif user.user_type == 'student':
            exams = Exam.objects.filter(course__class_enrolled__students__user=user)
        else:
            exams = Exam.objects.all()
        
        total_exams = exams.count()
        upcoming_exams = ExamSchedule.objects.filter(
            exam__in=exams,
            start_date__gte=timezone.now().date()
        ).count()
        ongoing_exams = 0
        completed_exams = 0
        
        for schedule in ExamSchedule.objects.filter(exam__in=exams):
            if schedule.is_ongoing:
                ongoing_exams += 1
            elif schedule.is_completed:
                completed_exams += 1
        
        # Calculate average pass rate
        results = ExamResult.objects.filter(exam__in=exams, is_submitted=True)
        if results:
            passed_count = results.filter(is_passed=True).count()
            average_pass_rate = (passed_count / results.count()) * 100
        else:
            average_pass_rate = 0
        
        # Get grade distribution
        grade_distribution = results.values('grade').annotate(
            count=Count('grade')
        ).order_by('grade')
        
        data = {
            'total_exams': total_exams,
            'upcoming_exams': upcoming_exams,
            'ongoing_exams': ongoing_exams,
            'completed_exams': completed_exams,
            'average_pass_rate': round(average_pass_rate, 2),
            'total_students': Student.objects.count(),
            'total_results': results.count(),
            'grade_distribution': {
                item['grade']: item['count'] 
                for item in grade_distribution
            }
        }
        
        return Response(data)

    @action(detail=False, methods=['get'])
    def student_performance(self, request):
        """Get student performance analytics"""
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response(
                {'error': 'student_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = ExamResult.objects.filter(student_id=student_id, is_submitted=True)
        serializer = StudentExamPerformanceSerializer(results, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def subject_performance(self, request):
        """Get performance by subject"""
        subject_id = request.query_params.get('subject_id')
        if not subject_id:
            return Response(
                {'error': 'subject_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = ExamResult.objects.filter(
            exam__subject_id=subject_id,
            is_submitted=True
        )
        
        if results:
            avg_percentage = results.aggregate(avg=Avg('percentage'))['avg']
            pass_rate = (results.filter(is_passed=True).count() / results.count()) * 100
            total_exams = results.values('exam').distinct().count()
        else:
            avg_percentage = 0
            pass_rate = 0
            total_exams = 0
        
        return Response({
            'subject_id': subject_id,
            'total_exams': total_exams,
            'average_percentage': round(avg_percentage or 0, 2),
            'pass_rate': round(pass_rate, 2),
            'total_results': results.count()
        })

    @action(detail=False, methods=['get'])
    def exam_trends(self, request):
        """Get exam performance trends over time"""
        days = int(request.query_params.get('days', 30))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        results = ExamResult.objects.filter(
            submitted_at__date__range=[start_date, end_date],
            is_submitted=True
        )
        
        # Group by date
        daily_performance = results.extra(
            select={'date': "DATE(submitted_at)"}
        ).values('date').annotate(
            avg_percentage=Avg('percentage'),
            count=Count('id'),
            passed_count=Count('id', filter=Q(is_passed=True))
        ).order_by('date')
        
        trends = []
        for item in daily_performance:
            pass_rate = (item['passed_count'] / item['count']) * 100 if item['count'] > 0 else 0
            trends.append({
                'date': item['date'],
                'average_percentage': round(item['avg_percentage'] or 0, 2),
                'total_exams': item['count'],
                'pass_rate': round(pass_rate, 2)
            })
        
        return Response(trends)
