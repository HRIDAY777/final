from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Course, Lesson, Enrollment, LessonProgress, Quiz, QuizAttempt,
    CourseReview, Certificate, Discussion, CourseCategory
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """User serializer for course instructors and students"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()


class CourseCategorySerializer(serializers.ModelSerializer):
    """Course category serializer"""
    course_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = CourseCategory
        fields = '__all__'


class CourseSerializer(serializers.ModelSerializer):
    """Course list serializer"""
    instructor = UserSerializer(read_only=True)
    category_name = serializers.CharField(source='category', read_only=True)
    enrolled_students = serializers.IntegerField(read_only=True)
    average_rating = serializers.DecimalField(
        max_digits=3, decimal_places=2, read_only=True
    )
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description', 'short_description',
            'thumbnail', 'video_intro', 'category', 'category_name',
            'level', 'language', 'price', 'is_free', 'discount_price',
            'total_lessons', 'total_duration', 'total_quizzes',
            'is_published', 'is_featured', 'status', 'instructor',
            'enrolled_students', 'average_rating', 'total_reviews',
            'completion_rate', 'created_at', 'updated_at'
        ]


class CourseDetailSerializer(serializers.ModelSerializer):
    """Course detail serializer with full information"""
    instructor = UserSerializer(read_only=True)
    lessons = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()
    enrollment_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = '__all__'
    
    def get_lessons(self, obj):
        from .serializers import LessonSerializer
        lessons = obj.lessons.all()
        return LessonSerializer(lessons, many=True).data
    
    def get_reviews(self, obj):
        from .serializers import CourseReviewSerializer
        reviews = obj.reviews.all()[:5]  # Limit to 5 reviews
        return CourseReviewSerializer(reviews, many=True).data
    
    def get_enrollment_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            enrollment = obj.enrollments.filter(student=request.user).first()
            if enrollment:
                return {
                    'enrolled': True,
                    'status': enrollment.status,
                    'progress': enrollment.progress,
                    'started_at': enrollment.started_at
                }
        return {'enrolled': False}


class CourseCreateSerializer(serializers.ModelSerializer):
    """Course creation serializer"""
    class Meta:
        model = Course
        fields = [
            'title', 'slug', 'description', 'short_description',
            'category', 'level', 'language', 'price', 'is_free',
            'discount_price', 'learning_objectives', 'requirements',
            'target_audience', 'curriculum'
        ]
    
    def create(self, validated_data):
        validated_data['instructor'] = self.context['request'].user
        return super().create(validated_data)


class LessonSerializer(serializers.ModelSerializer):
    """Lesson serializer"""
    course_title = serializers.CharField(source='course.title', read_only=True)
    progress_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Lesson
        fields = '__all__'
    
    def get_progress_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            enrollment = obj.course.enrollments.filter(
                student=request.user
            ).first()
            if enrollment:
                progress = obj.progress.filter(enrollment=enrollment).first()
                if progress:
                    return {
                        'status': progress.status,
                        'completed': progress.status == 'completed',
                        'video_watched': progress.video_watched,
                        'video_completed': progress.video_completed
                    }
        return {'status': 'not_started', 'completed': False}


class LessonCreateSerializer(serializers.ModelSerializer):
    """Lesson creation serializer"""
    class Meta:
        model = Lesson
        fields = [
            'course', 'title', 'description', 'content', 'video_url',
            'video_duration', 'attachments', 'order', 'is_free',
            'lesson_type', 'completion_criteria'
        ]


class EnrollmentSerializer(serializers.ModelSerializer):
    """Enrollment serializer"""
    student = UserSerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    
    class Meta:
        model = Enrollment
        fields = '__all__'


class EnrollmentCreateSerializer(serializers.ModelSerializer):
    """Enrollment creation serializer"""
    class Meta:
        model = Enrollment
        fields = ['course']
    
    def create(self, validated_data):
        validated_data['student'] = self.context['request'].user
        validated_data['total_lessons'] = validated_data['course'].total_lessons
        return super().create(validated_data)
    
    def validate(self, data):
        course = data['course']
        user = self.context['request'].user
        
        # Check if already enrolled
        if Enrollment.objects.filter(student=user, course=course).exists():
            raise serializers.ValidationError(
                "You are already enrolled in this course."
            )
        
        # Check if course is published
        if not course.is_published:
            raise serializers.ValidationError(
                "This course is not available for enrollment."
            )
        
        return data


class LessonProgressSerializer(serializers.ModelSerializer):
    """Lesson progress serializer"""
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    course_title = serializers.CharField(
        source='lesson.course.title', read_only=True
    )
    
    class Meta:
        model = LessonProgress
        fields = '__all__'


class LessonProgressUpdateSerializer(serializers.ModelSerializer):
    """Lesson progress update serializer"""
    class Meta:
        model = LessonProgress
        fields = ['status', 'video_watched', 'video_completed']
    
    def update(self, instance, validated_data):
        # Update progress status based on completion criteria
        lesson = instance.lesson
        if lesson.completion_criteria == 'watch' and validated_data.get('video_completed'):
            validated_data['status'] = 'completed'
        elif lesson.completion_criteria == 'read':
            validated_data['status'] = 'completed'
        
        return super().update(instance, validated_data)


class QuizSerializer(serializers.ModelSerializer):
    """Quiz serializer"""
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    total_questions = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = '__all__'
    
    def get_total_questions(self, obj):
        return len(obj.questions) if obj.questions else 0


class QuizAttemptSerializer(serializers.ModelSerializer):
    """Quiz attempt serializer"""
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    student_name = serializers.CharField(
        source='enrollment.student.get_full_name', read_only=True
    )
    
    class Meta:
        model = QuizAttempt
        fields = '__all__'


class QuizAttemptCreateSerializer(serializers.ModelSerializer):
    """Quiz attempt creation serializer"""
    class Meta:
        model = QuizAttempt
        fields = ['quiz', 'answers']
    
    def create(self, validated_data):
        validated_data['enrollment'] = self.context['enrollment']
        validated_data['total_questions'] = len(validated_data['quiz'].questions)
        
        # Calculate score
        quiz = validated_data['quiz']
        answers = validated_data['answers']
        correct_count = 0
        
        for question in quiz.questions:
            question_id = str(question.get('id'))
            if question_id in answers:
                if answers[question_id] == question.get('correct_answer'):
                    correct_count += 1
        
        validated_data['correct_answers'] = correct_count
        validated_data['score'] = (correct_count / validated_data['total_questions']) * 100
        validated_data['passed'] = validated_data['score'] >= quiz.passing_score
        
        return super().create(validated_data)


class CourseReviewSerializer(serializers.ModelSerializer):
    """Course review serializer"""
    student = UserSerializer(read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    
    class Meta:
        model = CourseReview
        fields = '__all__'


class CourseReviewCreateSerializer(serializers.ModelSerializer):
    """Course review creation serializer"""
    class Meta:
        model = CourseReview
        fields = ['course', 'rating', 'title', 'comment']
    
    def create(self, validated_data):
        validated_data['student'] = self.context['request'].user
        validated_data['enrollment'] = Enrollment.objects.get(
            student=validated_data['student'],
            course=validated_data['course']
        )
        return super().create(validated_data)
    
    def validate(self, data):
        course = data['course']
        user = self.context['request'].user
        
        # Check if user is enrolled
        if not Enrollment.objects.filter(student=user, course=course).exists():
            raise serializers.ValidationError(
                "You must be enrolled in this course to review it."
            )
        
        # Check if already reviewed
        if CourseReview.objects.filter(student=user, course=course).exists():
            raise serializers.ValidationError(
                "You have already reviewed this course."
            )
        
        return data


class CertificateSerializer(serializers.ModelSerializer):
    """Certificate serializer"""
    student = UserSerializer(read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    
    class Meta:
        model = Certificate
        fields = '__all__'


class DiscussionSerializer(serializers.ModelSerializer):
    """Discussion serializer"""
    author = UserSerializer(read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    replies_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Discussion
        fields = '__all__'
    
    def get_replies_count(self, obj):
        return obj.replies.count()


class DiscussionCreateSerializer(serializers.ModelSerializer):
    """Discussion creation serializer"""
    class Meta:
        model = Discussion
        fields = ['course', 'parent', 'title', 'content']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


# Dashboard and Analytics Serializers
class ELearningDashboardSerializer(serializers.Serializer):
    """E-learning dashboard data serializer"""
    total_courses = serializers.IntegerField()
    total_students = serializers.IntegerField()
    total_enrollments = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    average_completion_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    popular_courses = serializers.ListField()
    recent_enrollments = serializers.ListField()
    top_instructors = serializers.ListField()


class CourseAnalyticsSerializer(serializers.Serializer):
    """Course analytics serializer"""
    course_id = serializers.UUIDField()
    course_title = serializers.CharField()
    enrollments_count = serializers.IntegerField()
    completion_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    average_rating = serializers.DecimalField(max_digits=3, decimal_places=2)
    revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    lesson_completion_data = serializers.ListField()


class StudentProgressSerializer(serializers.Serializer):
    """Student progress serializer"""
    student_id = serializers.UUIDField()
    student_name = serializers.CharField()
    enrolled_courses = serializers.IntegerField()
    completed_courses = serializers.IntegerField()
    total_time_spent = serializers.IntegerField()  # in minutes
    average_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    certificates_earned = serializers.IntegerField()
